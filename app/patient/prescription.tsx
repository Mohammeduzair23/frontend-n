import RecordListScreen from '../../components/patient/RecordListScreen';
import { RECORD_TYPES } from '../../lib/records-config';

export default function PrescriptionsScreen() {
  return <RecordListScreen type={RECORD_TYPES.PRESCRIPTION} />;
}