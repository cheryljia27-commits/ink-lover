
import { Ink, UsageRecord, AppData } from '../types';

const STORAGE_KEYS = {
  INKS: 'inks-data-v2',
  RECORDS: 'records-data-v2',
  SNAPSHOTS: 'inks-snapshots'
};

export const storageService = {
  getInks: (): Ink[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INKS);
    return data ? JSON.parse(data) : [];
  },
  saveInks: (inks: Ink[]) => {
    localStorage.setItem(STORAGE_KEYS.INKS, JSON.stringify(inks));
  },
  getRecords: (): UsageRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  },
  saveRecords: (records: UsageRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },
  
  // Cloud-like Export/Import Logic
  exportFullData: (): string => {
    const data: AppData = {
      inks: storageService.getInks(),
      records: storageService.getRecords(),
      version: '2.0.0',
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data);
  },

  importFullData: (jsonString: string): boolean => {
    try {
      const data: AppData = JSON.parse(jsonString);
      if (Array.isArray(data.inks) && Array.isArray(data.records)) {
        storageService.saveInks(data.inks);
        storageService.saveRecords(data.records);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  },

  downloadAsFile: () => {
    const dataStr = storageService.exportFullData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ink-library-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
