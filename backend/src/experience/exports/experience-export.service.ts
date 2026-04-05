import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

interface SatisfactionTrend {
  period: string;
  score: number;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

interface DecliningPatient {
  patientId: string;
  patientName: string;
  currentScore: number;
  previousScore: number;
  decline: number;
}

@Injectable()
export class ExperienceExportService {
  generateExperienceReport(
    trends: SatisfactionTrend[],
    declining: DecliningPatient[],
    filters: { startDate: string; endDate: string },
  ): Buffer {
    const workbook = XLSX.utils.book_new();

    // Satisfaction Trends sheet
    const trendsData = [
      ['Satisfaction Trends Report'],
      ['Generated', new Date().toISOString()],
      ['Period', `${filters.startDate} to ${filters.endDate}`],
      [''],
      ['Date', 'Satisfaction Score', 'Positive', 'Neutral', 'Negative', 'Total'],
      ...trends.map((t) => [t.period, t.score, t.positive, t.neutral, t.negative, t.total]),
    ];
    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Trends');

    // Declining Patients sheet
    if (declining && declining.length > 0) {
      const declineData = [
        ['Patients with Declining Satisfaction'],
        [''],
        ['Patient Name', 'Current Score', 'Previous Score', 'Decline'],
        ...declining.map((p) => [p.patientName, p.currentScore, p.previousScore, p.decline]),
      ];
      const declineSheet = XLSX.utils.aoa_to_sheet(declineData);
      XLSX.utils.book_append_sheet(workbook, declineSheet, 'Declining Patients');
    }

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
