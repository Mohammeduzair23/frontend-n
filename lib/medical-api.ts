import { api } from './api';
import { RECORD_TYPES, RecordType } from './records-config';

export interface MedicalRecordResponse {
  id: string;
  patientId: string;
  hospitalName: string;
  doctorName: string;
  recordType: string;
  description?: string;
  details?: string;
  recordDate: string;
  patientCondition?: string;
  medications?: string;
  allergies?: string;
  softcopyPath?: string;
  prescriptionPath?: string;
  createdAt?: string;
}

export interface PrescriptionResponse {
  id: string;
  patientId: string;
  hospitalName: string;
  doctorName: string;
  medicineName: string;
  instructions?: string;
  notes?: string;
  prescriptionDate: string;
  status?: string;
  prescriptionImage?: string;
  createdAt?: string;
}

export interface LabResultResponse {
  id: string;
  patientId: string;
  hospitalName: string;
  doctorName: string;
  report?: string;
  instructions?: string;
  labResultDate: string;
  reportPath?: string;
  createdAt?: string;
}

export type RecordResponse = MedicalRecordResponse | PrescriptionResponse | LabResultResponse;

const ENDPOINTS: Record<RecordType, string> = {
  [RECORD_TYPES.MEDICAL]: '/medical/records',
  [RECORD_TYPES.PRESCRIPTION]: '/prescription/records',
  [RECORD_TYPES.LAB]: '/lab/records',
};

// Leave Content-Type unset — RN's networking layer generates the multipart
// boundary itself; setting 'multipart/form-data' manually drops the boundary
// and the backend can't parse the parts. Same convention as web axiosConfig.
const MULTIPART = { headers: { 'Content-Type': undefined } } as const;

export const medicalApi = {
  getRecords: (type: RecordType) =>
    api.get<{ success: boolean; count: number; records: RecordResponse[] }>(ENDPOINTS[type])
      .then(res => res.data),

  addRecord: (type: RecordType, formData: FormData) =>
    api.post<{ success: boolean; record: RecordResponse }>(ENDPOINTS[type], formData, MULTIPART)
      .then(res => res.data),

  updateRecord: (type: RecordType, recordId: string, formData: FormData) =>
    api.put<{ success: boolean; record: RecordResponse }>(`${ENDPOINTS[type]}/${recordId}`, formData, MULTIPART)
      .then(res => res.data),

  deleteRecord: (type: RecordType, recordId: string) =>
    api.delete<{ success: boolean; message: string }>(`${ENDPOINTS[type]}/${recordId}`)
      .then(res => res.data),
};