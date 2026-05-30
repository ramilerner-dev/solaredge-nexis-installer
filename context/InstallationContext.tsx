import React, { createContext, useContext, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteDetails {
  customerName: string;
  siteName: string;
  installerName: string;
  address: string;
  isIndoor: boolean;
  roomSizeConfirmed: boolean;
  rainProtectedConfirmed: boolean;
  systemType: string;
  notes: string;
}

export type Procedure = 'solaredge' | 'tpo';

export type StepStatus = 'pending' | 'in-progress' | 'complete';

export interface StepState {
  status: StepStatus;
  photoCount: number;
  completedAt: string | null; // ISO timestamp
}

interface InstallationContextType {
  // Site details
  siteDetails: SiteDetails;
  updateSiteDetails: (partial: Partial<SiteDetails>) => void;

  // Procedure
  selectedProcedure: Procedure;
  setProcedure: (p: Procedure) => void;

  // Step progress
  currentStepIndex: number;
  steps: StepState[];
  markStepComplete: (stepIndex: number) => void;
  addPhoto: (stepIndex: number) => void;
  setCurrentStepIndex: (index: number) => void;

  // Session control
  installationInProgress: boolean;
  exitInstallation: (stepIndex: number) => void;
  startFresh: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SITE_DETAILS: SiteDetails = {
  customerName: 'Andrea Smith',
  siteName: 'Green Valley Solar',
  installerName: 'John Smith',
  address: '14 Sunridge Ave, California',
  isIndoor: true,
  roomSizeConfirmed: true,
  rainProtectedConfirmed: false,
  systemType: 'SolarEdge Nexis 3ph',
  notes: '',
};

const makeInitialSteps = (): StepState[] =>
  Array(12)
    .fill(null)
    .map(() => ({ status: 'pending' as StepStatus, photoCount: 0, completedAt: null }));

// ─── Context ──────────────────────────────────────────────────────────────────

const InstallationContext = createContext<InstallationContextType | undefined>(undefined);

export function InstallationProvider({ children }: { children: React.ReactNode }) {
  const [siteDetails, setSiteDetails] = useState<SiteDetails>({ ...DEFAULT_SITE_DETAILS });
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure>('solaredge');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<StepState[]>(makeInitialSteps());
  const [installationInProgress, setInstallationInProgress] = useState(false);

  const updateSiteDetails = (partial: Partial<SiteDetails>) => {
    setSiteDetails((prev) => ({ ...prev, ...partial }));
  };

  const setProcedure = (p: Procedure) => setSelectedProcedure(p);

  const markStepComplete = (stepIndex: number) => {
    setSteps((prev) => {
      const next = prev.map((s, i) => {
        if (i === stepIndex) {
          return { ...s, status: 'complete' as StepStatus, completedAt: new Date().toISOString() };
        }
        return s;
      });
      return next;
    });
    const nextIndex = stepIndex + 1;
    if (nextIndex < 12) {
      setCurrentStepIndex(nextIndex);
    }
  };

  const addPhoto = (stepIndex: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === stepIndex ? { ...s, photoCount: s.photoCount + 1 } : s))
    );
  };

  const exitInstallation = (stepIndex: number) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i === stepIndex && s.status === 'pending') {
          return { ...s, status: 'in-progress' as StepStatus };
        }
        return s;
      })
    );
    setInstallationInProgress(false);
  };

  const startFresh = () => {
    setSiteDetails({ ...DEFAULT_SITE_DETAILS });
    setSelectedProcedure('solaredge');
    setCurrentStepIndex(0);
    setSteps(makeInitialSteps());
    setInstallationInProgress(false);
  };

  const beginInstallation = () => setInstallationInProgress(true);

  return (
    <InstallationContext.Provider
      value={{
        siteDetails,
        updateSiteDetails,
        selectedProcedure,
        setProcedure,
        currentStepIndex,
        steps,
        markStepComplete,
        addPhoto,
        setCurrentStepIndex,
        installationInProgress,
        exitInstallation,
        startFresh,
      }}
    >
      {children}
    </InstallationContext.Provider>
  );
}

export function useInstallation(): InstallationContextType {
  const ctx = useContext(InstallationContext);
  if (!ctx) throw new Error('useInstallation must be used within InstallationProvider');
  return ctx;
}
