import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { upsertHistoryEntry, removeHistoryEntry, refreshHistoryEntryDate } from '@/utils/historyUtils';

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

export type StepStatus = 'pending' | 'complete';

export interface StepState {
  status: StepStatus;
  photoCount: number;
  completedAt: string | null; // ISO timestamp
}

export interface HistoryEntry {
  id: string;
  date: string; // ISO timestamp; updates on save and resume
  siteDetails: SiteDetails;
  procedure: Procedure;
  currentStepIndex: number;
  steps: StepState[];
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
  toggleStepComplete: (stepIndex: number) => void;
  addPhoto: (stepIndex: number) => void;
  setCurrentStepIndex: (index: number) => void;

  // Session control
  installationInProgress: boolean;
  beginInstallation: () => void;
  exitInstallation: (stepIndex: number) => void;
  startFresh: () => void;

  // History
  history: HistoryEntry[];
  activeEntryId: string | null;
  saveOrUpdateActiveInstallation: () => void;
  resumeFromHistory: (id: string) => void;
  startNewInstallation: () => void;
  deleteFromHistory: (id: string) => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SITE_DETAILS: SiteDetails = {
  customerName: 'Andrea Smith',
  siteName: 'Green Valley Solar',
  installerName: 'John Smith',
  address: '14 Sunridge Ave, California',
  isIndoor: true,
  roomSizeConfirmed: false,
  rainProtectedConfirmed: false,
  systemType: 'SolarEdge Nexis 3ph',
  notes: '',
};

const makeInitialSteps = (): StepState[] =>
  Array(12)
    .fill(null)
    .map(() => ({ status: 'pending' as StepStatus, photoCount: 0, completedAt: null }));

const makeNewId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const HISTORY_FILE = `${FileSystem.documentDirectory}nexis-history.json`;
const ACTIVE_FILE = `${FileSystem.documentDirectory}nexis-active.json`;

async function readJsonFile<T>(uri: string): Promise<T | null> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(uri);
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(uri: string, value: unknown): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(value));
  } catch {
    // swallow — persistence is best-effort
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const InstallationContext = createContext<InstallationContextType | undefined>(undefined);

export function InstallationProvider({ children }: { children: React.ReactNode }) {
  const [siteDetails, setSiteDetails] = useState<SiteDetails>({ ...DEFAULT_SITE_DETAILS });
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure>('solaredge');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<StepState[]>(makeInitialSteps());
  const [installationInProgress, setInstallationInProgress] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  // ── Hydrate from disk on mount ──
  useEffect(() => {
    (async () => {
      try {
        const [historyParsed, activeParsed] = await Promise.all([
          readJsonFile<HistoryEntry[]>(HISTORY_FILE),
          readJsonFile<any>(ACTIVE_FILE),
        ]);
        if (Array.isArray(historyParsed)) setHistory(historyParsed);
        if (activeParsed && typeof activeParsed === 'object') {
          if (activeParsed.siteDetails) setSiteDetails(activeParsed.siteDetails);
          if (activeParsed.selectedProcedure) setSelectedProcedure(activeParsed.selectedProcedure);
          if (typeof activeParsed.currentStepIndex === 'number') setCurrentStepIndex(activeParsed.currentStepIndex);
          if (Array.isArray(activeParsed.steps)) setSteps(activeParsed.steps);
          if (typeof activeParsed.installationInProgress === 'boolean') setInstallationInProgress(activeParsed.installationInProgress);
          if (typeof activeParsed.activeEntryId === 'string' || activeParsed.activeEntryId === null) setActiveEntryId(activeParsed.activeEntryId);
        }
      } finally {
        hydratedRef.current = true;
      }
    })();
  }, []);

  // ── Persist history on every change (after hydration) ──
  useEffect(() => {
    if (!hydratedRef.current) return;
    writeJsonFile(HISTORY_FILE, history);
  }, [history]);

  // ── Persist active state on every change (after hydration) ──
  useEffect(() => {
    if (!hydratedRef.current) return;
    writeJsonFile(ACTIVE_FILE, {
      siteDetails,
      selectedProcedure,
      currentStepIndex,
      steps,
      installationInProgress,
      activeEntryId,
    });
  }, [siteDetails, selectedProcedure, currentStepIndex, steps, installationInProgress, activeEntryId]);

  // ── Actions ──

  const updateSiteDetails = (partial: Partial<SiteDetails>) => {
    setSiteDetails((prev) => ({ ...prev, ...partial }));
  };

  const setProcedure = (p: Procedure) => setSelectedProcedure(p);

  const markStepComplete = (stepIndex: number) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === stepIndex
          ? { ...s, status: 'complete' as StepStatus, completedAt: new Date().toISOString() }
          : s
      )
    );
    const nextIndex = stepIndex + 1;
    if (nextIndex < 12) setCurrentStepIndex(nextIndex);
  };

  const toggleStepComplete = (stepIndex: number) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i !== stepIndex) return s;
        if (s.status === 'complete') {
          return { ...s, status: 'pending' as StepStatus, completedAt: null };
        }
        return { ...s, status: 'complete' as StepStatus, completedAt: new Date().toISOString() };
      })
    );
  };

  const addPhoto = (stepIndex: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === stepIndex ? { ...s, photoCount: s.photoCount + 1 } : s))
    );
  };

  const exitInstallation = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  const beginInstallation = () => {
    setCurrentStepIndex(0);
    setInstallationInProgress(true);
  };

  const startFresh = () => {
    setSiteDetails({ ...DEFAULT_SITE_DETAILS });
    setSelectedProcedure('solaredge');
    setCurrentStepIndex(0);
    setSteps(makeInitialSteps());
    setInstallationInProgress(false);
    setActiveEntryId(null);
  };

  // ── History actions ──

  const saveOrUpdateActiveInstallation = () => {
    const snapshot: HistoryEntry = {
      id: activeEntryId ?? makeNewId(),
      date: new Date().toISOString(),
      siteDetails,
      procedure: selectedProcedure,
      currentStepIndex,
      steps,
    };
    setHistory((prev) => upsertHistoryEntry(prev, snapshot));
    if (!activeEntryId) setActiveEntryId(snapshot.id);
  };

  const resumeFromHistory = (id: string) => {
    // Auto-save current active install if it has any progress and isn't already this entry
    const hasProgress =
      steps.some((s) => s.status === 'complete' || s.photoCount > 0) || currentStepIndex > 0;
    if (hasProgress && activeEntryId !== id) {
      const currentSnap: HistoryEntry = {
        id: activeEntryId ?? makeNewId(),
        date: new Date().toISOString(),
        siteDetails,
        procedure: selectedProcedure,
        currentStepIndex,
        steps,
      };
      setHistory((prev) => upsertHistoryEntry(prev, currentSnap));
    }

    // Find target entry and load it into active state, refreshing its date
    setHistory((prev) => {
      const target = prev.find((e) => e.id === id);
      if (!target) return prev;
      setSiteDetails(target.siteDetails);
      setSelectedProcedure(target.procedure);
      setCurrentStepIndex(target.currentStepIndex);
      setSteps(target.steps);
      setInstallationInProgress(true);
      setActiveEntryId(target.id);
      return refreshHistoryEntryDate(prev, id, new Date().toISOString());
    });
  };

  const startNewInstallation = () => {
    // Source history entry is left untouched. Active state resets to defaults.
    setSiteDetails({ ...DEFAULT_SITE_DETAILS });
    setSelectedProcedure('solaredge');
    setCurrentStepIndex(0);
    setSteps(makeInitialSteps());
    setInstallationInProgress(false);
    setActiveEntryId(null);
  };

  const deleteFromHistory = (id: string) => {
    setHistory((prev) => removeHistoryEntry(prev, id));
    if (activeEntryId === id) setActiveEntryId(null);
  };

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
        toggleStepComplete,
        addPhoto,
        setCurrentStepIndex,
        installationInProgress,
        beginInstallation,
        exitInstallation,
        startFresh,
        history,
        activeEntryId,
        saveOrUpdateActiveInstallation,
        resumeFromHistory,
        startNewInstallation,
        deleteFromHistory,
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

