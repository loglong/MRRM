/**
 * OpenClaw CLI - HTTP API Client
 * Makes authenticated HTTP calls to the MRRM backend API.
 * Includes: Bearer auth header, retry on 500, request timeout.
 */

import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const REQUEST_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 2;

export interface ApiError {
  message: string;
  status?: number;
}

export class ApiClient {
  private jwt: string;
  private orgId: string;

  constructor(jwt: string, orgId: string) {
    this.jwt = jwt;
    this.orgId = orgId;
  }

  private async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    data?: any,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response: AxiosResponse<T> = await axios.request<T>({
          method,
          url: `${API_BASE_URL}${path}`,
          data,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.jwt}`,
            'x-org-id': this.orgId,
          },
          timeout: REQUEST_TIMEOUT,
        });
        return response.data;
      } catch (err) {
        const error = err as AxiosError<{ message?: string; error?: string }>;

        // 401 — not retryable, throw immediately
        if (error.response?.status === 401) {
          throw new Error('Unauthorized — please re-login');
        }

        // 400/422 — validation error, not retryable
        if (error.response?.status === 400 || error.response?.status === 422) {
          const msg =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Validation error';
          throw new Error(msg);
        }

        // 500 — retry with backoff
        if (error.response?.status === 500) {
          lastError = error;
          if (attempt < MAX_RETRIES) {
            await this.sleep(1000 * (attempt + 1)); // 1s, 2s backoff
            continue;
          }
        }

        // Network errors, timeouts, etc.
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          throw new Error(
            `Cannot connect to API at ${API_BASE_URL}. Is the backend running?`,
          );
        }

        // All other errors
        lastError = error;
        if (attempt < MAX_RETRIES) {
          await this.sleep(1000 * (attempt + 1));
          continue;
        }
      }
    }

    throw new Error(
      `Server error after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
    );
  }

  // --- Convenience methods ---

  async get<T = any>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T = any>(path: string, data?: any): Promise<T> {
    return this.request<T>('POST', path, data);
  }

  async put<T = any>(path: string, data?: any): Promise<T> {
    return this.request<T>('PUT', path, data);
  }

  async delete<T = any>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  // --- Patient helpers ---

  async createPatient(data: any): Promise<any> {
    return this.post('/patients', data);
  }

  async findPatientByPhone(phone: string): Promise<any | null> {
    try {
      const result = await this.get<{ data: any[] }>(`/patients?search=${encodeURIComponent(phone)}&limit=5`);
      return result.data?.[0] ?? null;
    } catch {
      return null;
    }
  }

  // --- Demand helpers ---

  async createDemand(data: any): Promise<any> {
    return this.post('/demands', data);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
