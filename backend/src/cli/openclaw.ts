/**
 * OpenClaw CLI - Main Entry Point
 * Commands:
 *   npx ts-node src/cli/openclaw.ts shell
 *   npx ts-node src/cli/openclaw.ts import patients <csv>
 *   npx ts-node src/cli/openclaw.ts import demands <csv>
 */

import * as readline from 'readline';
import { loginInteractive, CliUser } from './auth';
import { ApiClient } from './api-client';
import { importPatients, importDemands, printSummary } from './csv-import';

// --- State ---

let currentUser: CliUser | null = null;
let currentJwt: string | null = null;

// --- Interactive shell ---

async function runShell(): Promise<void> {
  console.clear();
  console.log('=== OpenClaw CLI ===');
  console.log('Medical Patient Relationship Management System\n');

  // Login
  const authResult = await loginInteractive();
  if (!authResult.success || !authResult.jwt || !authResult.user) {
    console.error(`\nLogin failed: ${authResult.error}`);
    process.exit(1);
  }

  currentJwt = authResult.jwt;
  currentUser = authResult.user;
  console.log(`\nWelcome, ${currentUser.name} (${currentUser.email})`);
  console.log(`Organization: ${currentUser.orgId}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () =>
    new Promise<string>((resolve) => {
      rl.question('openclaw> ', (answer) => resolve(answer.trim()));
    });

  console.log('Available commands:');
  console.log('  1 — Import patients from CSV');
  console.log('  2 — Import demands from CSV');
  console.log('  help — Show this menu');
  console.log('  exit — Quit\n');

  while (true) {
    const input = await prompt();
    const [cmd, ...args] = input.toLowerCase().split(/\s+/);

    if (cmd === '1' || cmd === 'import patients') {
      if (args.length === 0) {
        console.log('Usage: import patients <file.csv>');
        continue;
      }
      await runImportPatients(args[0]);
    } else if (cmd === '2' || cmd === 'import demands') {
      if (args.length === 0) {
        console.log('Usage: import demands <file.csv>');
        continue;
      }
      await runImportDemands(args[0]);
    } else if (cmd === 'help' || cmd === '?') {
      console.log('Available commands:');
      console.log('  1, import patients <file.csv> — Import patients');
      console.log('  2, import demands <file.csv>  — Import demands');
      console.log('  exit — Quit');
    } else if (cmd === 'exit' || cmd === 'quit' || cmd === 'q') {
      console.log('Goodbye!');
      break;
    } else if (cmd === '') {
      // empty line — just re-prompt
    } else {
      console.log(`Unknown command: ${cmd}. Type "help" for available commands.`);
    }
  }

  rl.close();
}

// --- Import helpers ---

async function requireAuth(): Promise<ApiClient> {
  if (!currentJwt || !currentUser) {
    throw new Error('Not authenticated. Run "openclaw shell" first.');
  }
  return new ApiClient(currentJwt, currentUser.orgId);
}

async function runImportPatients(csvPath: string): Promise<void> {
  console.log(`\nImporting patients from: ${csvPath}`);
  const client = await requireAuth();
  const summary = await importPatients(client, csvPath);
  printSummary('Patients', summary);
}

async function runImportDemands(csvPath: string): Promise<void> {
  console.log(`\nImporting demands from: ${csvPath}`);
  const client = await requireAuth();
  const summary = await importDemands(client, csvPath);
  printSummary('Demands', summary);
}

// --- Main CLI dispatch ---

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  if (!command) {
    printUsage();
    process.exit(0);
  }

  if (command === 'shell') {
    await runShell();
  } else if (command === 'import') {
    const subCommand = args[1]?.toLowerCase();
    const csvPath = args[2];

    if (!csvPath) {
      console.error('Usage: openclaw import <patients|demands> <file.csv>');
      process.exit(1);
    }

    if (subCommand === 'patients') {
      // Non-interactive: require OPENCLAW_JWT and OPENCLAW_ORG_ID env vars
      const jwt = process.env.OPENCLAW_JWT;
      const orgId = process.env.OPENCLAW_ORG_ID;
      if (!jwt || !orgId) {
        console.error('Error: OPENCLAW_JWT and OPENCLAW_ORG_ID env vars are required for batch import.');
        console.error('Or use: npx ts-node src/cli/openclaw.ts shell');
        process.exit(1);
      }
      const client = new ApiClient(jwt, orgId);
      const summary = await importPatients(client, csvPath);
      printSummary('Patients', summary);
      process.exit(summary.failed > 0 ? 1 : 0);
    } else if (subCommand === 'demands') {
      const jwt = process.env.OPENCLAW_JWT;
      const orgId = process.env.OPENCLAW_ORG_ID;
      if (!jwt || !orgId) {
        console.error('Error: OPENCLAW_JWT and OPENCLAW_ORG_ID env vars are required for batch import.');
        console.error('Or use: npx ts-node src/cli/openclaw.ts shell');
        process.exit(1);
      }
      const client = new ApiClient(jwt, orgId);
      const summary = await importDemands(client, csvPath);
      printSummary('Demands', summary);
      process.exit(summary.failed > 0 ? 1 : 0);
    } else {
      console.error(`Unknown import type: ${subCommand}. Use "patients" or "demands".`);
      process.exit(1);
    }
  } else if (command === 'help' || command === '--help' || command === '-h') {
    printUsage();
  } else {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }
}

function printUsage(): void {
  console.log(`
OpenClaw CLI — MRRM Batch Import Tool

Usage:
  npx ts-node src/cli/openclaw.ts shell
    Interactive shell — login and import with guided prompts.

  npx ts-node src/cli/openclaw.ts import patients <file.csv>
    Batch import patients from CSV (requires env vars).

  npx ts-node src/cli/openclaw.ts import demands <file.csv>
    Batch import demands from CSV (requires env vars).

Environment variables (for batch import):
  OPENCLAW_JWT       JWT token from login
  OPENCLAW_ORG_ID    Organization ID
  API_BASE_URL       Backend URL (default: http://localhost:3000)

CSV format — patients:
  name,phone,gender,age,tier
  张三,13800001111,MALE,1990,REGULAR

CSV format — demands:
  patient_phone,title,type,description,priority,source
  13800001111,洗牙套餐,CONSULTATION,需要美白牙齿,HIGH,WALK_IN
`);
}

main().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
