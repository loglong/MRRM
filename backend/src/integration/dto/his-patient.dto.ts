export class HisPatientDto {
  patientMrn: string; // medical record number
  name: string;
  gender: string;
  birthDate: string; // YYYY-MM-DD
  phone: string;
  idCard: string; // encrypted in MRRM
  allergyHistory: string;
  pastHistory: string;
}
