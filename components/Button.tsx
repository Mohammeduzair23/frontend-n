import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline';

type Props = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: Variant;
  icon?: React.ReactNode;
};

const bg: Record<Variant, string> = {
  primary: 'bg-blue-600',
  secondary: 'bg-slate-100',
  outline: 'bg-white border border-slate-300',
};

const textColor: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-slate-900',
  outline: 'text-slate-900',
};

export function Button({ label, loading, variant = 'primary', disabled, icon, ...props }: Props) {
  return (
    <Pressable
      disabled={disabled || loading}
      className={`rounded-xl py-4 items-center justify-center flex-row ${bg[variant]} ${
        disabled || loading ? 'opacity-60' : ''
      }`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#0f172a'} />
      ) : (
        <>
          {icon}
          <Text className={`font-semibold text-base ${textColor[variant]} ${icon ? 'ml-2' : ''}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}