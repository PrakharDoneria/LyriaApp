'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface QuotaContextType {
  remaining: number;
  total: number;
  canGenerate: boolean;
  useQuota: () => void;
  isBypassed: boolean;
  tryBypass: (email: string) => boolean;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

const LIMITS = {
  daily: 1,
  weekly: 1
};

export const QuotaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [remaining, setRemaining] = useState(1);
  const [isBypassed, setIsBypassed] = useState(false);

  useEffect(() => {
    const bypass = localStorage.getItem('lyria_bypass') === 'true';
    setIsBypassed(bypass);
    
    if (bypass) {
      setRemaining(999);
    } else {
      const usage = JSON.parse(localStorage.getItem('lyria_usage_v3') || '[]');
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      
      const dailyUsage = usage.filter((ts: number) => now - ts < dayMs);
      setRemaining(Math.max(0, LIMITS.daily - dailyUsage.length));
    }
  }, []);

  const useQuota = () => {
    if (isBypassed) return;
    
    const usage = JSON.parse(localStorage.getItem('lyria_usage_v3') || '[]');
    usage.push(Date.now());
    localStorage.setItem('lyria_usage_v3', JSON.stringify(usage));
    setRemaining(prev => Math.max(0, prev - 1));
  };

  const tryBypass = (email: string) => {
    if (email.toLowerCase() === 'harshvardhan.singh@geeksforgeeks.org') {
      localStorage.setItem('lyria_bypass', 'true');
      setIsBypassed(true);
      setRemaining(999);
      return true;
    }
    return false;
  };

  return (
    <QuotaContext.Provider value={{ remaining, total: LIMITS.daily, canGenerate: remaining > 0, useQuota, isBypassed, tryBypass }}>
      {children}
    </QuotaContext.Provider>
  );
};

export const useQuota = () => {
  const context = useContext(QuotaContext);
  if (!context) throw new Error('useQuota must be used within QuotaProvider');
  return context;
};
