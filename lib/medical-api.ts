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

// FIX HISTORY for "Required part 'data' is not present":
//
// Round 1: added `transformRequest: (data) => data` — bypasses axios's
// default transform, which can JSON-stringify RN's FormData into "{}" if
// axios's FormData detection misses it. Necessary, but not sufficient alone.
//
// Round 2 (this one): removed the explicit `Content-Type: multipart/form-data`
// header entirely. Setting that header yourself — even without a boundary —
// can make some RN/native networking layers treat content-type as "already
// handled," so they skip auto-generating the `boundary=...` parameter. With
// no boundary, the server can't split the body into parts at all, which
// surfaces as this exact "part not present" error. The fix is to not set
// Content-Type at all here (not even to `undefined` as a header value —
// omit the key entirely) so RN's XHR implementation owns both the
// Content-Type and the boundary when it sees a FormData body.
const MULTIPART = {
  transformRequest: (data: FormData) => data,
};

export const medicalApi = {
  getRecords: (type: RecordType) =>
    api.get<{ success: boolean; count: number; records: RecordResponse[] }>(ENDPOINTS[type])
      .then(res => {
        if (!res.data.success) throw new Error('The server could not load records.');
        return res.data;
      }),

  addRecord: (type: RecordType, formData: FormData) =>
    api.post<{ success: boolean; record: RecordResponse }>(ENDPOINTS[type], formData, MULTIPART)
      .then(res => {
        if (!res.data.success) throw new Error('The server could not add this record.');
        return res.data;
      }),

  updateRecord: (type: RecordType, recordId: string, formData: FormData) =>
    api.put<{ success: boolean; record: RecordResponse }>(`${ENDPOINTS[type]}/${recordId}`, formData, MULTIPART)
      .then(res => {
        if (!res.data.success) throw new Error('The server could not update this record.');
        return res.data;
      }),

  deleteRecord: (type: RecordType, recordId: string) =>
    api.delete<{ success: boolean; message: string }>(`${ENDPOINTS[type]}/${recordId}`)
      .then(res => {
        if (!res.data.success) throw new Error(res.data.message || 'The server could not delete this record.');
        return res.data;
      }),
};
