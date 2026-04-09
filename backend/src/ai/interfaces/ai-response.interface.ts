export interface AiResponseMeta {
  model: string;
  timestamp: string;
}

export interface AiSuccessResponse<T> {
  success: true;
  data: T;
  meta: AiResponseMeta;
}

export interface AiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
  meta: AiResponseMeta;
}

export type AiResponse<T> = AiSuccessResponse<T> | AiErrorResponse;

const AI_MODEL_NAME = 'MRRM-Patient-Skill-v1';

export function successResponse<T>(data: T): AiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      model: AI_MODEL_NAME,
      timestamp: new Date().toISOString(),
    },
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: string
): AiErrorResponse {
  return {
    success: false,
    error: { code, message, details },
    meta: {
      model: AI_MODEL_NAME,
      timestamp: new Date().toISOString(),
    },
  };
}
