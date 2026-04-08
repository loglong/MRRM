/**
 * OpenClaw CLI - CSV Batch Import
 * Parses CSV files and imports patients or demands row-by-row.
 * Includes: enum pre-validation, phone truncation in logs, input sanitization.
 */

import * as fs from 'fs';
import * as readline from 'readline';
import { ApiClient } from './api-client';

// --- Enum validators (pre-validate before API calls) ---

const VALID_GENDER = new Set(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']);
const VALID_TIER = new Set(['HIGH_VALUE', 'REGULAR', 'LOST_RISK']);
const VALID_DEMAND_TYPE = new Set(['CONSULTATION', 'TREATMENT', 'FOLLOWUP', 'OTHER']);
const VALID_DEMAND_PRIORITY = new Set(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
const VALID_DEMAND_SOURCE = new Set(['PHONE', 'WECHAT', 'WEB', 'WALK_IN', 'REFERRAL', 'CAMPAIGN', 'OTHER']);

// --- Helpers ---

function sanitize(value: any, maxLen = 1000): string {
  if (value == null) return '';
  return String(value)
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .substring(0, maxLen);
}

function truncatePhone(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
}

async function parseCSV(filePath: string): Promise<string[][]> {
  const rows: string[][] = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream });

  for await (const line of rl) {
    if (line.trim() === '') continue;
    // Simple CSV parsing — handles quoted fields with commas
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }

  return rows;
}

function headerToIndex(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headers.forEach((h, i) => map.set(h.trim().toLowerCase(), i));
  return map;
}

// --- Patient import ---

export interface PatientRow {
  name: string;
  phone?: string;
  gender?: string;
  age?: number;
  tier?: string;
  allergyHistory?: string;
  pastHistory?: string;
}

export interface ImportSummary {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export async function importPatients(
  client: ApiClient,
  filePath: string,
): Promise<ImportSummary> {
  const rows = await parseCSV(filePath);
  if (rows.length < 2) {
    return { total: 0, success: 0, failed: 0, errors: ['CSV file is empty or has no data rows'] };
  }

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const headerIdx = headerToIndex(headers);

  const required = ['name'];
  for (const col of required) {
    if (headerIdx.get(col) === undefined) {
      return {
        total: 0,
        success: 0,
        failed: 0,
        errors: [`Missing required column: ${col}`],
      };
    }
  }

  const summary: ImportSummary = { total: rows.length - 1, success: 0, failed: 0, errors: [] };
  const patientCache = new Map<string, string>(); // phone → id (memoize lookups)

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    // Helper to get cell value safely
    const get = (col: string): string => {
      const idx = headerIdx.get(col.toLowerCase());
      return idx !== undefined ? (row[idx] || '').trim() : '';
    };

    // Pre-validation: gender
    const genderRaw = get('gender');
    if (genderRaw && !VALID_GENDER.has(genderRaw.toUpperCase())) {
      const err = `ERROR row ${rowNum}: gender=${genderRaw} — must be one of MALE, FEMALE, OTHER, UNKNOWN (skipping)`;
      summary.errors.push(err);
      summary.failed++;
      continue;
    }

    // Pre-validation: tier
    const tierRaw = get('tier');
    if (tierRaw && !VALID_TIER.has(tierRaw.toUpperCase())) {
      const err = `ERROR row ${rowNum}: tier=${tierRaw} — must be one of HIGH_VALUE, REGULAR, LOST_RISK (skipping)`;
      summary.errors.push(err);
      summary.failed++;
      continue;
    }

    // Build payload — sanitize all string fields
    const ageStr = get('age');
    const birthDate = ageStr ? `${ageStr}-01-01T00:00:00.000Z` : undefined;

    const payload: any = {
      name: sanitize(get('name'), 100),
      phone: sanitize(get('phone'), 20) || undefined,
      gender: genderRaw ? genderRaw.toUpperCase() : undefined,
      birthDate: birthDate || undefined,
      tier: tierRaw ? tierRaw.toUpperCase() : undefined,
    };

    // Optional encrypted fields
    const allergy = get('allergyHistory');
    const past = get('pastHistory');
    if (allergy) payload.allergyHistory = sanitize(allergy, 2000);
    if (past) payload.pastHistory = sanitize(past, 2000);

    // Phone memoization: cache phone→id to avoid repeated lookups for same phone
    const phoneKey = payload.phone || '__none__';
    if (patientCache.has(phoneKey)) {
      // Already imported this phone in this batch — skip as duplicate
      const err = `WARN row ${rowNum}: phone=${truncatePhone(phoneKey)} — duplicate phone in batch, skipping`;
      summary.errors.push(err);
      summary.failed++;
      continue;
    }

    try {
      const result = await client.createPatient(payload);
      patientCache.set(phoneKey, result.id);
      summary.success++;
    } catch (err: any) {
      const phone = payload.phone || 'N/A';
      const errMsg = `ERROR row ${rowNum}: phone=${truncatePhone(phone)} — ${err.message} (skipping)`;
      summary.errors.push(errMsg);
      summary.failed++;
    }
  }

  return summary;
}

// --- Demand import ---

export interface DemandRow {
  patient_phone: string;
  title: string;
  type: string;
  description: string;
  priority?: string;
  source?: string;
}

export async function importDemands(
  client: ApiClient,
  filePath: string,
): Promise<ImportSummary> {
  const rows = await parseCSV(filePath);
  if (rows.length < 2) {
    return { total: 0, success: 0, failed: 0, errors: ['CSV file is empty or has no data rows'] };
  }

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const headerIdx = headerToIndex(headers);

  const required = ['patient_phone', 'title', 'type'];
  for (const col of required) {
    if (headerIdx.get(col) === undefined) {
      return {
        total: 0,
        success: 0,
        failed: 0,
        errors: [`Missing required column: ${col}`],
      };
    }
  }

  const summary: ImportSummary = { total: rows.length - 1, success: 0, failed: 0, errors: [] };
  const patientCache = new Map<string, string>(); // phone → patientId

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    const get = (col: string): string => {
      const idx = headerIdx.get(col.toLowerCase());
      return idx !== undefined ? (row[idx] || '').trim() : '';
    };

    const phone = sanitize(get('patient_phone'), 20);
    const typeRaw = get('type').toUpperCase();
    const priorityRaw = get('priority').toUpperCase();
    const sourceRaw = get('source').toUpperCase();

    // Pre-validation: type
    if (!VALID_DEMAND_TYPE.has(typeRaw)) {
      const err = `ERROR row ${rowNum}: type=${typeRaw} — must be one of CONSULTATION, TREATMENT, FOLLOWUP, OTHER (skipping)`;
      summary.errors.push(err);
      summary.failed++;
      continue;
    }

    // Pre-validation: priority
    if (priorityRaw && !VALID_DEMAND_PRIORITY.has(priorityRaw)) {
      const err = `ERROR row ${rowNum}: priority=${priorityRaw} — must be one of LOW, MEDIUM, HIGH, URGENT (skipping)`;
      summary.errors.push(err);
      summary.failed++;
      continue;
    }

    // Pre-validation: source
    if (sourceRaw && !VALID_DEMAND_SOURCE.has(sourceRaw)) {
      const err = `ERROR row ${rowNum}: source=${sourceRaw} — must be one of PHONE, WECHAT, WEB, WALK_IN, REFERRAL, CAMPAIGN, OTHER (skipping)`;
      summary.errors.push(err);
      summary.failed++;
      continue;
    }

    // Patient lookup by phone
    let patientId: string | undefined = patientCache.get(phone);
    if (!patientId) {
      const patient = await client.findPatientByPhone(phone);
      if (!patient) {
        const err = `ERROR row ${rowNum}: phone=${truncatePhone(phone)} — Patient not found (skipping)`;
        summary.errors.push(err);
        summary.failed++;
        continue;
      }
      patientId = patient.id;
      patientCache.set(phone, patientId as string);
    }

    const payload = {
      patientId,
      title: sanitize(get('title'), 100),
      type: typeRaw,
      description: sanitize(get('description'), 1000),
      priority: priorityRaw || 'MEDIUM',
      source: sourceRaw || 'WALK_IN',
    };

    try {
      await client.createDemand(payload);
      summary.success++;
    } catch (err: any) {
      const errMsg = `ERROR row ${rowNum}: phone=${truncatePhone(phone)} — ${err.message} (skipping)`;
      summary.errors.push(errMsg);
      summary.failed++;
    }
  }

  return summary;
}

// --- Summary printer ---

export function printSummary(label: string, summary: ImportSummary): void {
  console.log(`\n=== ${label} Import Summary ===`);
  console.log(`Total rows: ${summary.total}`);
  console.log(`Imported:   ${summary.success}`);
  console.log(`Failed:     ${summary.failed}`);

  if (summary.errors.length > 0) {
    console.log('\n--- Errors / Warnings ---');
    // Deduplicate errors
    const seen = new Set<string>();
    for (const err of summary.errors) {
      if (seen.has(err)) continue;
      seen.add(err);
      console.log(err);
    }
  }

  if (summary.failed > 0 && summary.success > 0) {
    console.log(`\nPartial success: ${summary.success}/${summary.total} rows imported.`);
  } else if (summary.success === 0) {
    console.log('\nNo rows imported. Check errors above.');
  }
}
