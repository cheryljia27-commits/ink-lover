
import { Ink, UsageRecord } from '../types';

const STORAGE_KEYS = {
  INKS: 'inks-data-v2',
  RECORDS: 'records-data-v2',
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
  }
};
