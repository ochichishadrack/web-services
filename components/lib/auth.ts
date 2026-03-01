import { getApiBaseUrl } from '@/api/api';

export async function loginUser(
  email: string,
  password: string
): Promise<{
  success: boolean;
  userId?: string;
  phoneNumberPrimary?: string | null;
  error?: string;
}> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/local/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include', // 🔥 ensure cookies are stored
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || 'Login failed',
      };
    }

    return {
      success: true,
      userId: data.userId,
      phoneNumberPrimary: data.phone_number_primary ?? null,
    };
  } catch (err) {
    console.error('Login error:', err);
    return {
      success: false,
      error: 'Network error. Try again later.',
    };
  }
}
