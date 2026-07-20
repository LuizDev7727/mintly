const STORAGE_KEY = "mintly:resumable-uploads";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

type ResumableUploadRecord = {
  key: string;
  uploadId: string;
  fileName: string;
  fileSize: number;
  fileLastModified: number;
  updatedAt: number;
};

type ResumableUploadFingerprint = {
  name: string;
  size: number;
  lastModified: number;
};

function readAll(): ResumableUploadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ResumableUploadRecord[];
  } catch {
    return [];
  }
}

function writeAll(records: ResumableUploadRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function isExpired(record: ResumableUploadRecord): boolean {
  return Date.now() - record.updatedAt > TTL_MS;
}

export function findResumableUpload(
  fingerprint: ResumableUploadFingerprint,
): ResumableUploadRecord | null {
  const records = readAll().filter((record) => !isExpired(record));

  const match = records.find(
    (record) =>
      record.fileName === fingerprint.name &&
      record.fileSize === fingerprint.size &&
      record.fileLastModified === fingerprint.lastModified,
  );

  return match ?? null;
}

export function saveResumableUpload(
  record: Omit<ResumableUploadRecord, "updatedAt">,
): void {
  const records = readAll().filter((entry) => entry.key !== record.key);
  records.push({ ...record, updatedAt: Date.now() });
  writeAll(records);
}

export function removeResumableUpload(key: string): void {
  writeAll(readAll().filter((record) => record.key !== key));
}
