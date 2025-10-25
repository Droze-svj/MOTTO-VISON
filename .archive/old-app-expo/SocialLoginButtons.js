import React from 'react';

const BACKEND_URL = process.env.API_URL || 'http://localhost:8000';

export default function SocialLoginButtons() {
  const handleSocialLogin = (provider) => {
    window.open(`${BACKEND_URL}/auth/${provider}`, '_self');
  };
  return (
    <div>
      <button onClick={() => handleSocialLogin('google')}>Sign in with Google</button>
      <button onClick={() => handleSocialLogin('microsoft')}>Sign in with Microsoft</button>
      <button onClick={() => handleSocialLogin('apple')}>Sign in with Apple</button>
      <button onClick={() => handleSocialLogin('facebook')}>Sign in with Facebook</button>
    </div>
  );
} 