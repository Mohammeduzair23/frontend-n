import RecordListScreen from '../../components/patient/RecordListScreen';
import { RECORD_TYPES } from '../../lib/records-config';

export default function LabResultsScreen() {
  return <RecordListScreen type={RECORD_TYPES.LAB} />;
}