# Frontend Security Checklist

- Always use HTTPS for API calls
- Never expose secrets (API keys, tokens) in frontend code
- Use secure storage for tokens (e.g., Expo SecureStore for React Native)
- Sanitize all user-generated content before rendering (to prevent XSS)
- Use npm audit or yarn audit for JS dependencies
- Add a GitHub Action for dependency scanning
- Set secure headers if serving web assets (CSP, X-Frame-Options, etc.)
- Use secure, short-lived tokens for authentication
- Implement token refresh and logout properly 