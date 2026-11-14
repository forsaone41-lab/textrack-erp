import React from 'react';
import { CoutureLoader } from './CoutureLoader';

export const PageLoader: React.FC<{ message?: string; subMessage?: string }> = ({ message, subMessage }) => {
  return <CoutureLoader message={message} subMessage={subMessage} minHeight="min-h-[60vh]" />;
};
