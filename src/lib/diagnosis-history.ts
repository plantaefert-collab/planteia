import type { Diagnosis } from "./types";

const KEY = "plantae:photo-diagnosis-history";
const MAX_ENTRIES = 5;

export type DiagnosisFeedbackRating = "acertou" | "errou";

export interface DiagnosisFeedback {
  rating: DiagnosisFeedbackRating;
  note?: string;
  createdAt: string;
}

export interface PhotoDiagnosisHistoryEntry {
  id: string;
  createdAt: string;
  plantId?: string;
  plantNickname?: string;
  plantSpecies?: string;
  symptom?: string;
  objective?: string;
  answers?: Record<string, unknown>;
  photos: string[]; // data URLs
  thumbnail?: string;
  diagnosis: Diagnosis;
  feedback?: DiagnosisFeedback;
}

function read(): PhotoDiagnosisHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: PhotoDiagnosisHistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Quota exceeded — drop the oldest and retry once.
    try {
      window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, Math.max(1, entries.length - 1))));
    } catch {
      /* ignore */
    }
  }
}

export const diagnosisHistory = {
  list(): PhotoDiagnosisHistoryEntry[] {
    return read();
  },
  add(entry: Omit<PhotoDiagnosisHistoryEntry, "id" | "createdAt"> & { id?: string; createdAt?: string }) {
    const next: PhotoDiagnosisHistoryEntry = {
      id: entry.id ?? crypto.randomUUID(),
      createdAt: entry.createdAt ?? new Date().toISOString(),
      plantId: entry.plantId,
      plantNickname: entry.plantNickname,
      plantSpecies: entry.plantSpecies,
      symptom: entry.symptom,
      objective: entry.objective,
      answers: entry.answers,
      photos: entry.photos,
      thumbnail: entry.thumbnail ?? entry.photos[0],
      diagnosis: entry.diagnosis,
    };
    const all = [next, ...read()].slice(0, MAX_ENTRIES);
    write(all);
    return next;
  },
  remove(id: string) {
    write(read().filter((e) => e.id !== id));
  },
  clear() {
    write([]);
  },
};
