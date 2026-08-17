import RecordListScreen from '../../components/patient/RecordListScreen';
import { RECORD_TYPES } from '../../lib/records-config';

export default function MedicalRecordsScreen() {
  return <RecordListScreen type={RECORD_TYPES.MEDICAL} />;
}