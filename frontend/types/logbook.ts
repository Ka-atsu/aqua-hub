// types/logbook.ts

export interface ExtractedLog {
  id: number;
  date: string;
  name: string;
  newGallon: number;
  oldGallon: number;
  type: string;
  address: string;
}

export interface FileUploadDropzoneProps {
  file: File | null;
  onUpload: (file: File) => void;
}

export interface ExtractedDataTableProps {
  data: ExtractedLog[];
  onFieldChange: (
    id: number,
    field: keyof ExtractedLog,
    value: string | number,
  ) => void;
  onSave: () => void;
  isSaving: boolean;
}
