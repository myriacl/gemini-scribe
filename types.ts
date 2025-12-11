export enum Language {
  ENGLISH = 'English',
  FRENCH = 'French'
}

export interface TranscriptionState {
  isRecording: boolean;
  isProcessing: boolean;
  text: string | null;
  error: string | null;
}

export interface AudioRecording {
  blob: Blob;
  mimeType: string;
}