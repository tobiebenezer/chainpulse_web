'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch, getActiveEnvironment, setActiveEnvironment } from '@/lib/api-client';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  kyb_status: string;
  is_superuser: boolean;
}

interface DashboardContextType {
  env: 'sandbox' | 'production';
  handleEnvChange: (newEnv: 'sandbox' | 'production') => void;
  tenant: Tenant;
  kybData: any;
  loadingMe: boolean;
  logoutMutation: UseMutationResult<any, Error, void, unknown>;
  submitKybMutation: UseMutationResult<any, Error, void, unknown>;
  
  // KYB Modal states
  showKybModal: boolean;
  setShowKybModal: (show: boolean) => void;
  kybFullName: string;
  setKybFullName: (val: string) => void;
  kybBusinessName: string;
  setKybBusinessName: (val: string) => void;
  kybPhoneNumber: string;
  setKybPhoneNumber: (val: string) => void;
  kybCountry: string;
  setKybCountry: (val: string) => void;
  kybCategory: string;
  setKybCategory: (val: string) => void;
  kybWebsite: string;
  setKybWebsite: (val: string) => void;
  kybUseCase: string;
  setKybUseCase: (val: string) => void;
  kybIdType: string;
  setKybIdType: (val: string) => void;
  kybIdNumber: string;
  setKybIdNumber: (val: string) => void;
  kybError: string;
  setKybError: (val: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // App environment state
  const [env, setEnv] = useState<'sandbox' | 'production'>('sandbox');
  
  // KYB Modal Input States
  const [showKybModal, setShowKybModal] = useState(false);
  const [kybFullName, setKybFullName] = useState('');
  const [kybBusinessName, setKybBusinessName] = useState('');
  const [kybPhoneNumber, setKybPhoneNumber] = useState('');
  const [kybCountry, setKybCountry] = useState('');
  const [kybCategory, setKybCategory] = useState('');
  const [kybWebsite, setKybWebsite] = useState('');
  const [kybUseCase, setKybUseCase] = useState('');
  const [kybIdType, setKybIdType] = useState('passport');
  const [kybIdNumber, setKybIdNumber] = useState('');
  const [kybError, setKybError] = useState('');

  // Load environment from localStorage on mount
  useEffect(() => {
    setEnv(getActiveEnvironment());
  }, []);

  const handleEnvChange = (newEnv: 'sandbox' | 'production') => {
    setActiveEnvironment(newEnv);
    setEnv(newEnv);
    // Invalidate everything to trigger new fetch with correct headers
    queryClient.invalidateQueries();
  };

  // Queries
  const { data: meData, error: meError, isLoading: loadingMe } = useQuery<{ tenant: Tenant }>({
    queryKey: ['me'],
    queryFn: () => apiFetch<{ tenant: Tenant }>('/v1/me'),
    retry: false,
  });

  const { data: kybData } = useQuery<any>({
    queryKey: ['kyb'],
    queryFn: () => apiFetch<any>('/v1/kyb').catch(() => null),
    enabled: !!meData,
  });

  // Redirect if unauthenticated
  useEffect(() => {
    if (meError) {
      router.push('/login');
    }
  }, [meError, router]);

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: () => apiFetch('/v1/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });

  const submitKybMutation = useMutation({
    mutationFn: async () => {
      setKybError('');
      return apiFetch('/v1/kyb', {
        method: 'POST',
        body: JSON.stringify({
          full_name: kybFullName,
          business_name: kybBusinessName,
          phone_number: kybPhoneNumber,
          country: kybCountry,
          business_category: kybCategory,
          website_or_social: kybWebsite,
          intended_use_case: kybUseCase,
          id_type: kybIdType,
          id_number: kybIdNumber,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['kyb'] });
      setShowKybModal(false);
    },
    onError: (err: any) => {
      setKybError(err.message || 'Failed to submit KYB profile');
    }
  });

  if (loadingMe || !meData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', background: 'var(--bg-void)' }}>
        <div className="animate-pulse-glow" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-block', width: '24px', height: '24px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
          <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            SYNCHRONIZING SECURE TUNNEL...
          </span>
        </div>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{
      env,
      handleEnvChange,
      tenant: meData.tenant,
      kybData,
      loadingMe,
      logoutMutation,
      submitKybMutation,
      showKybModal,
      setShowKybModal,
      kybFullName,
      setKybFullName,
      kybBusinessName,
      setKybBusinessName,
      kybPhoneNumber,
      setKybPhoneNumber,
      kybCountry,
      setKybCountry,
      kybCategory,
      setKybCategory,
      kybWebsite,
      setKybWebsite,
      kybUseCase,
      setKybUseCase,
      kybIdType,
      setKybIdType,
      kybIdNumber,
      setKybIdNumber,
      kybError,
      setKybError
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
