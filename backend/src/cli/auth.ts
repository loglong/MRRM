/**
 * OpenClaw CLI - JWT Authentication
 * Authenticates via the existing /auth/login API and stores JWT in memory.
 */

import * as readline from 'readline';
import axios, { AxiosError } from 'axios';

export interface CliUser {
  id: string;
  email: string;
  name: string;
  orgId: string;
}

export interface AuthResult {
  success: boolean;
  jwt?: string;
  user?: CliUser;
  error?: string;
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

function promptInput(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function loginInteractive(): Promise<AuthResult> {
  console.log('\n=== OpenClaw Login ===\n');

  const email = await promptInput('Email: ');
  const password = await promptInput('Password: ');
  const orgCode = await promptInput('Organization Code (e.g. DEFAULT_ORG): ');

  return login(email, password, orgCode);
}

export async function login(
  email: string,
  password: string,
  orgCode: string,
): Promise<AuthResult> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        email,
        password,
        orgId: orgCode || undefined,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    const { accessToken, user } = response.data as {
      accessToken: string;
      user: CliUser;
    };

    return {
      success: true,
      jwt: accessToken,
      user,
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Invalid credentials. Check email, password, and org code.',
      };
    }
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: `Cannot connect to API at ${API_BASE_URL}. Is the backend running?`,
      };
    }
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Login failed',
    };
  }
}
