const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export function getActiveEnvironment(): 'sandbox' | 'production' {
  if (typeof window === 'undefined') return 'sandbox';
  return (localStorage.getItem('cp_env') as 'sandbox' | 'production') || 'sandbox';
}

export function setActiveEnvironment(env: 'sandbox' | 'production') {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cp_env', env);
    window.dispatchEvent(new Event('storage_cp_env'));
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const env = getActiveEnvironment();
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Environment', env);

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important for sending/receiving session cookies
  };

  const response = await fetch(`${API_BASE_URL}${path}`, config);

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) {
        errMsg = data.error;
      }
    } catch {
      // ignore JSON parse error for non-JSON error pages
    }
    throw new APIError(errMsg, response.status);
  }

  // Handle empty or 204 responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
