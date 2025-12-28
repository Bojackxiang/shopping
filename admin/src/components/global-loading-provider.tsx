'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import GlobalLoading from './global-loading';

interface GlobalLoadingContextType {
  isLoading: boolean;
  message?: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const GlobalLoadingContext = createContext<
  GlobalLoadingContextType | undefined
>(undefined);

export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error(
      'useGlobalLoading must be used within GlobalLoadingProvider'
    );
  }
  return context;
};

interface GlobalLoadingProviderProps {
  children: React.ReactNode;
}

export const GlobalLoadingProvider = ({
  children
}: GlobalLoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setMessage(undefined);
  }, []);

  return (
    <GlobalLoadingContext.Provider
      value={{ isLoading, message, showLoading, hideLoading }}
    >
      {children}
      <GlobalLoading isOpen={isLoading} message={message} />
    </GlobalLoadingContext.Provider>
  );
};
