import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { medicalApi } from '../../lib/medical-api';
import {
    buildFormDataForSubmit,
    FieldConfig,
    FILE_LIMITS,
    FormValues,
    getInitialFormData,
    Mode,
    MODES,
    PickedFile,
    RECORDS_CONFIG,
    RecordType,
    validateForm,
} from '../../lib/records-config';

// ============================================
// FIELD RENDERER
// ============================================
function FormField({
  fieldName, config, value, onChange, disabled,
}: {
  fieldName: string; config: FieldConfig; value: string; onChange: (v: string) => void; disabled: boolean;
}) {
  const [showDate, setShowDate] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-2">
        {config.label} {config.required && <Text className="text-red-500">*</Text>}
      </Text>

      {config.type === 'textarea' && (
        <TextInput
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          multiline
          numberOfLines={config.rows || 3}
          placeholder={config.placeholder}
          className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900"
          style={{ textAlignVertical: 'top', minHeight: (config.rows || 3) * 20 }}
        />
      )}

      {config.type === 'select' && (
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {config.options?.map(opt => (
            <Pressable
              key={opt}
              disabled={disabled}
              onPress={() => onChange(opt)}
              className={`px-4 py-2 rounded-full border ${value === opt ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}
            >
              <Text className={value === opt ? 'text-white font-medium' : 'text-slate-600'}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {config.type === 'date' && (
        <>
          <Pressable
            disabled={disabled}
            onPress={() => setShowDate(true)}
            className="border border-slate-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
          >
            <Text className="text-slate-900">{value || 'Select date'}</Text>
            <Ionicons name="calendar-outline" size={18} color="#64748b" />
          </Pressable>
          {showDate && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event, selectedDate) => {
                setShowDate(false);
                if (selectedDate) onChange(selectedDate.toISOString().split('T')[0]);
              }}
            />
          )}
        </>
      )}

      {config.type === 'text' && (
        <TextInput
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          placeholder={config.placeholder}
          className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900"
        />
      )}
    </View>
  );
}

// ============================================
// FILE PICKER ROW
// ============================================
function FileField({
  fieldName, label, accept, requiredOnAdd, mode, file, existingFilePath, onPick, disabled,
}: {
  fieldName: string; label: string; accept: string[]; requiredOnAdd: boolean; mode: Mode;
  file: PickedFile | null; existingFilePath?: string | null; onPick: (f: PickedFile) => void; disabled: boolean;
}) {
  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: accept, copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    if (asset.size && asset.size > FILE_LIMITS.MAX_SIZE) {
      alert('File size must be less than 10MB');
      return;
    }

    onPick({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType || 'application/octet-stream', size: asset.size });
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-2">
        {label} {requiredOnAdd && mode === MODES.ADD && <Text className="text-red-500">*</Text>}
      </Text>

      {mode === MODES.EDIT && existingFilePath && !file && (
        <Pressable onPress={() => Linking.openURL(existingFilePath)} className="mb-2 p-3 bg-blue-50 rounded-lg">
          <Text className="text-blue-600 text-sm">View current file →</Text>
        </Pressable>
      )}

      <Pressable
        disabled={disabled}
        onPress={handlePick}
        className="flex-row items-center justify-center px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg"
      >
        <Ionicons name="document-attach-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
        <Text className="text-sm text-slate-600" numberOfLines={1}>
          {file ? file.name : mode === MODES.EDIT ? 'Upload new file (optional)' : 'Choose file'}
        </Text>
      </Pressable>
    </View>
  );
}

// ============================================
// MAIN MODAL
// ============================================
export default function RecordFormModal({
  visible, onClose, type, mode, recordId, existingData, onSuccess, onError,
}: {
  visible: boolean;
  onClose: () => void;
  type: RecordType;
  mode: Mode;
  recordId?: string;
  existingData?: Record<string, unknown> | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [formData, setFormData] = useState<FormValues>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) setFormData(getInitialFormData(type, existingData));
  }, [visible, type, existingData]);

  const config = RECORDS_CONFIG[type];

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleFilePick = (fieldName: string, file: PickedFile) => {
    setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const getExistingFilePath = (fileName: string): string | null => {
    if (mode === MODES.EDIT && existingData) {
      const fileConfig = config.files[fileName];
      return (existingData[fileConfig?.backendFieldName] as string) ?? null;
    }
    return null;
  };

  const handleSubmit = async () => {
    const validation = validateForm(type, formData, mode);
    if (!validation.valid) {
      onError(validation.message!);
      return;
    }
    if (mode === MODES.EDIT && !recordId) {
      onError('Record ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = buildFormDataForSubmit(type, formData);
      const result = mode === MODES.EDIT
        ? await medicalApi.updateRecord(type, recordId!, submitData)
        : await medicalApi.addRecord(type, submitData);

      if (result.success) {
        onSuccess(`${config.title} ${mode === MODES.EDIT ? 'updated' : 'added'} successfully!`);
        onClose();
      } else {
        onError(`Failed to ${mode} ${config.title.toLowerCase()}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      onError('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({});
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl" style={{ maxHeight: '90%' }}>

          {/* Header */}
          <View className="bg-blue-600 px-6 py-4 flex-row justify-between items-center rounded-t-2xl">
            <View>
              <Text className="text-xl font-bold text-white">
                {mode === MODES.EDIT ? 'Edit' : 'Add'} {config.title}
              </Text>
              <Text className="text-sm text-blue-100 mt-1">
                {mode === MODES.EDIT ? 'Update existing record' : 'Create new record'}
              </Text>
            </View>
            <Pressable onPress={handleClose} disabled={isSubmitting} className="p-2">
              <Ionicons name="close" size={24} color="#ffffff" />
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView className="px-6 py-4" contentContainerStyle={{ paddingBottom: 8 }}>
            {Object.entries(config.fields).map(([fieldName, fieldConfig]) => {
              if (mode === MODES.EDIT && fieldConfig.hideOnEdit) return null;
              return (
                <FormField
                  key={fieldName}
                  fieldName={fieldName}
                  config={fieldConfig}
                  value={(formData[fieldName] as string) || ''}
                  onChange={(v) => handleFieldChange(fieldName, v)}
                  disabled={isSubmitting}
                />
              );
            })}

            {Object.entries(config.files).map(([fileName, fileConfig]) => (
              <FileField
                key={fileName}
                fieldName={fileName}
                label={fileConfig.label}
                accept={fileConfig.accept}
                requiredOnAdd={fileConfig.requiredOnAdd}
                mode={mode}
                file={formData[fileName] as PickedFile | null}
                existingFilePath={getExistingFilePath(fileName)}
                onPick={(f) => handleFilePick(fileName, f)}
                disabled={isSubmitting}
              />
            ))}
          </ScrollView>

          {/* Footer */}
          <View className="border-t border-slate-200 px-6 py-4 flex-row" style={{ gap: 12 }}>
            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-lg items-center"
            >
              <Text className="text-slate-700 font-semibold">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 rounded-lg items-center flex-row justify-center"
              style={{ gap: 8 }}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text className="text-white font-semibold">Saving...</Text>
                </>
              ) : (
                <Text className="text-white font-semibold">{mode === MODES.EDIT ? 'Update Record' : 'Save Record'}</Text>
              )}
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}