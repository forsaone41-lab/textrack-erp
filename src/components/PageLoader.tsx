import React from 'react';
import { CoutureLoader } from './CoutureLoader';

export const PageLoader: React.FC<{ minHeight?: string; message?: string; subMessage?: string }> = ({ minHeight = 'min-h-[60vh]' }) => {
  return <CoutureLoader minHeight={minHeight} />;
};
