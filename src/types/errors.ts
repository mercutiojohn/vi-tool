export interface ErrorDetails {
  timestamp?: number;
  source?: string;
  originalError?: unknown;
  context?: Record<string, unknown>;
}

export interface SvgGenerationError extends Error {
  code?: string;
  details?: ErrorDetails;
}

export class GenerationError extends Error implements SvgGenerationError {
  code?: string;
  details?: ErrorDetails;

  constructor(message: string, code?: string, details?: ErrorDetails) {
    super(message);
    this.name = 'GenerationError';
    this.code = code;
    this.details = details;
  }
}
