'use client';

import { getApiBaseUrl } from '@/api/api';

interface Props {
  callbackUrl: string;
}

export default function GoogleLoginButton({ callbackUrl }: Props) {
  const handleGoogleLogin = () => {
    const encodedCallback = encodeURIComponent(callbackUrl);
    window.location.href = `${getApiBaseUrl()}/api/auth/login/google?callbackUrl=${encodedCallback}`;
  };

  function GoogleIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.86-6.86C35.64 2.09 30.23 0 24 0 14.61 0 6.51 5.38 2.56 13.22l7.98 6.2C12.39 13.39 17.73 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.5 24c0-1.63-.15-3.2-.43-4.7H24v9.2h12.7c-.55 2.96-2.22 5.47-4.74 7.15l7.28 5.66C43.97 36.89 46.5 30.94 46.5 24z"
        />
        <path
          fill="#FBBC05"
          d="M10.54 28.42a14.5 14.5 0 010-8.84l-7.98-6.2A24 24 0 000 24c0 3.87.93 7.53 2.56 10.78l7.98-6.36z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.92-2.14 15.89-5.82l-7.28-5.66c-2.02 1.36-4.6 2.18-8.61 2.18-6.27 0-11.61-3.89-13.46-9.92l-7.98 6.36C6.51 42.62 14.61 48 24 48z"
        />
      </svg>
    );
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 font-medium py-2 px-4 rounded-lg transition-all"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}
