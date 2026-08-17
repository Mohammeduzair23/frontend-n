// ============================================
// SINGLE SOURCE OF TRUTH — RECORDS CONFIGURATION
// React Native port of the web recordsConfig.ts.
// Same fields/files/validation logic; file values are
// { uri, name, mimeType } (from expo-document-picker) instead of File.
// ============================================

export const RECORD_TYPES = {
  MEDICAL: 'medical',
  PRESCRIPTION: 'prescription',
  LAB: 'lab',
} as const;

export type RecordType = typeof RECORD_TYPES[keyof typeof RECORD_TYPES];

export const MODES = {
  ADD: 'add',
  EDIT: 'edit',
} as const;

export type Mode = typeof MODES[keyof typeof MODES];

export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10 MB
};

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface FieldConfig {
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  required: boolean;
  placeholder?: string;
  rows?: number;
  options?: string[];
  defaultValue: string;
  hideOnEdit?: boolean;
}

export interface FileConfig {
  label: string;
  accept: string[]; // mime types passed to expo-document-picker
  requiredOnAdd: boolean;
  backendFieldName: string;
}

export interface CardDisplayField {
  key: string;
  label: string;
  priority: number;
  isFile?: boolean;
}

export interface CardConfig {
  icon: string; // Ionicons name
  iconColor: string;
  dateField: string;
  titleField: string;
  titleLabel?: string;
  statusField?: string;
  displayFields: CardDisplayField[];
}

export interface RecordConfig {
  title: string;
  fields: Record<string, FieldConfig>;
  files: Record<string, FileConfig>;
  card: CardConfig;
}

const today = () => new Date().toISOString().split('T')[0];

export const RECORDS_CONFIG: Record<RecordType, RecordConfig> = {

  [RECORD_TYPES.MEDICAL]: {
    title: 'Medical Record',
    fields: {
      recordType:       { label: 'Record Type', type: 'text', required: true, placeholder: 'e.g., General Checkup, Blood Test', defaultValue: '' },
      hospitalName:     { label: 'Hospital Name', type: 'text', required: true, placeholder: 'Enter hospital name', defaultValue: '' },
      doctorName:       { label: 'Doctor Name', type: 'text', required: true, placeholder: "Enter doctor's name", defaultValue: '' },
      description:      { label: 'Description', type: 'text', required: false, placeholder: 'Brief description', defaultValue: '' },
      details:          { label: 'Details', type: 'textarea', required: false, placeholder: 'Detailed information', defaultValue: '', rows: 3 },
      recordDate:       { label: 'Date', type: 'date', required: true, hideOnEdit: true, defaultValue: today() },
      patientCondition: { label: 'Patient Condition', type: 'text', required: false, placeholder: 'e.g., Hypertension, Diabetes', defaultValue: '' },
      medications:      { label: 'Current Medications', type: 'text', required: false, placeholder: 'Separate with commas', defaultValue: '' },
      allergies:        { label: 'Allergies', type: 'text', required: false, placeholder: 'Separate with commas', defaultValue: '' },
    },
    files: {
      softcopyFile:      { label: 'Medical Report (PDF/Doc)', accept: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], requiredOnAdd: false, backendFieldName: 'softcopyPath' },
      prescriptionImage: { label: 'Prescription Image', accept: ['image/*'], requiredOnAdd: false, backendFieldName: 'prescriptionPath' },
    },
    card: {
      icon: 'document-text-outline', iconColor: '#2563eb',
      dateField: 'recordDate', titleField: 'recordType',
      displayFields: [
        { key: 'hospitalName', label: 'Hospital', priority: 1 },
        { key: 'doctorName', label: 'Doctor', priority: 2 },
        { key: 'description', label: 'Description', priority: 3 },
        { key: 'details', label: 'Details', priority: 4 },
        { key: 'patientCondition', label: 'Condition', priority: 5 },
        { key: 'medications', label: 'Medications', priority: 6 },
        { key: 'allergies', label: 'Allergies', priority: 7 },
        { key: 'softcopyPath', label: 'View Report', priority: 8, isFile: true },
        { key: 'prescriptionPath', label: 'View Prescription', priority: 9, isFile: true },
      ],
    },
  },

  [RECORD_TYPES.PRESCRIPTION]: {
    title: 'Prescription',
    fields: {
      hospitalName:     { label: 'Hospital Name', type: 'text', required: true, placeholder: 'Enter hospital name', defaultValue: '' },
      doctorName:       { label: 'Doctor Name', type: 'text', required: true, placeholder: "Enter doctor's name", defaultValue: '' },
      medicineName:     { label: 'Medicine Name', type: 'text', required: true, placeholder: 'e.g., Amoxicillin', defaultValue: '' },
      instructions:     { label: 'Instructions', type: 'textarea', required: false, placeholder: 'e.g., Take with food', defaultValue: '', rows: 2 },
      notes:            { label: 'Notes', type: 'textarea', required: false, placeholder: 'Additional notes', defaultValue: '', rows: 2 },
      prescriptionDate: { label: 'Prescription Date', type: 'date', required: true, hideOnEdit: true, defaultValue: today() },
      status:           { label: 'Status', type: 'select', required: false, options: ['Active', 'Completed', 'Expired'], defaultValue: 'Active' },
    },
    files: {
      prescriptionImage: { label: 'Prescription Image/PDF', accept: ['image/*', 'application/pdf'], requiredOnAdd: true, backendFieldName: 'prescriptionImage' },
    },
    card: {
      icon: 'medkit-outline', iconColor: '#16a34a',
      dateField: 'prescriptionDate', titleField: 'medicineName', titleLabel: 'Medicine', statusField: 'status',
      displayFields: [
        { key: 'hospitalName', label: 'Hospital', priority: 1 },
        { key: 'doctorName', label: 'Doctor', priority: 2 },
        { key: 'instructions', label: 'Instructions', priority: 3 },
        { key: 'notes', label: 'Notes', priority: 4 },
        { key: 'prescriptionImage', label: 'View Prescription', priority: 5, isFile: true },
      ],
    },
  },

  [RECORD_TYPES.LAB]: {
    title: 'Lab Result',
    fields: {
      hospitalName:  { label: 'Hospital Name', type: 'text', required: true, placeholder: 'e.g., City Medical Center', defaultValue: '' },
      doctorName:    { label: 'Doctor Name', type: 'text', required: true, placeholder: "Enter doctor's name", defaultValue: '' },
      instructions:  { label: 'Instructions', type: 'textarea', required: false, placeholder: 'Test instructions', defaultValue: '', rows: 3 },
      report:        { label: 'Report Summary', type: 'text', required: false, placeholder: 'Brief report summary', defaultValue: '' },
      labResultDate: { label: 'Lab Result Date', type: 'date', required: true, hideOnEdit: true, defaultValue: today() },
    },
    files: {
      softcopyFile: { label: 'Lab Report', accept: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'], requiredOnAdd: true, backendFieldName: 'reportPath' },
    },
    card: {
      icon: 'flask-outline', iconColor: '#7c3aed',
      dateField: 'labResultDate', titleField: 'hospitalName',
      displayFields: [
        { key: 'hospitalName', label: 'Hospital', priority: 1 },
        { key: 'doctorName', label: 'Doctor', priority: 2 },
        { key: 'report', label: 'Report Summary', priority: 3 },
        { key: 'instructions', label: 'Instructions', priority: 4 },
        { key: 'reportPath', label: 'View Lab Report', priority: 5, isFile: true },
      ],
    },
  },
};

export type FormValues = Record<string, string | PickedFile | null>;

export const getInitialFormData = (
  type: RecordType,
  existingData?: Record<string, unknown> | null
): FormValues => {
  const config = RECORDS_CONFIG[type];
  const formData: FormValues = {};

  Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
    formData[fieldName] = (existingData?.[fieldName] as string) ?? fieldConfig.defaultValue;
  });

  Object.keys(config.files).forEach(fileName => {
    formData[fileName] = null;
  });

  return formData;
};

export const validateForm = (
  type: RecordType,
  formData: FormValues,
  mode: Mode
): { valid: boolean; message?: string } => {
  const config = RECORDS_CONFIG[type];

  for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
    if (mode === MODES.EDIT && fieldConfig.hideOnEdit) continue;
    if (fieldConfig.required) {
      const value = formData[fieldName];
      if (!value || String(value).trim() === '') {
        return { valid: false, message: `${fieldConfig.label} is required` };
      }
    }
  }

  if (mode === MODES.ADD) {
    for (const [fileName, fileConfig] of Object.entries(config.files)) {
      if (fileConfig.requiredOnAdd && !formData[fileName]) {
        return { valid: false, message: `${fileConfig.label} is required` };
      }
    }
  }

  return { valid: true };
};

/**
 * Builds a FormData object for @RequestPart("data") on the backend — same
 * contract as the web version (JSON blob named "data" + file parts).
 * ASSUMPTION (unverified against the real backend): RN's global Blob/FormData
 * handles this the same way web's does. If add/update 500s, try replacing
 * the Blob below with a plain `JSON.stringify(jsonFields)` string.
 */
export const buildFormDataForSubmit = (
  type: RecordType,
  formData: FormValues
): FormData => {
  const config = RECORDS_CONFIG[type];
  const submitData = new FormData();

  const jsonFields: Record<string, string> = {};
  Object.entries(config.fields).forEach(([fieldName]) => {
    const value = formData[fieldName];
    if (value !== null && value !== undefined && value !== '') {
      jsonFields[fieldName] = String(value);
    }
  });

  submitData.append(
    'data',
    new Blob([JSON.stringify(jsonFields)], { type: 'application/json' }) as any
  );

  Object.keys(config.files).forEach(fileName => {
    const file = formData[fileName] as PickedFile | null;
    if (file) {
      submitData.append(fileName, {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);
    }
  });

  return submitData;
};

export default RECORDS_CONFIG;