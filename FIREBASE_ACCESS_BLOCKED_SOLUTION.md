# Firebase Access Blocked Issue - Solution Guide

## Problem
Users are getting "Access blocked, please contact your admin" error when trying to create new accounts after creating multiple accounts to bypass free tier limits.

## Root Cause
Firebase Authentication has built-in security mechanisms that detect and block suspicious activity patterns, including:
- Multiple account creation attempts from the same IP address
- Rapid successive signup attempts
- Attempts to bypass service limits through multiple accounts

## Understanding the Block
This is a **Firebase Authentication-level security feature**, not something controlled by the application code. The block typically affects:
- The IP address used for multiple account creation
- The device fingerprint
- Sometimes the GitHub OAuth provider connection

## Solutions

### 1. Immediate Resolution (Admin Required)
**For Admin Users:**
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Check for any IP-based restrictions that might be blocking the user
3. Review Firebase Console → Authentication → Users to see if there are multiple accounts from the same user
4. Contact Firebase Support to request unblocking of the IP/user if necessary

### 2. Application-Level Improvements
**To prevent this issue in the future:**

#### A. Implement Proper Rate Limiting
Add rate limiting to the account creation endpoint:

```typescript
// In packages/functions/src/auth.ts
import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'account_creation',
  points: 3, // Allow 3 attempts
  duration: 3600, // Per hour
})

export const createNewUserAccount = onCall(async (request) => {
  // Rate limiting check
  const clientIP = request.rawRequest.ip
  try {
    await rateLimiter.consume(clientIP)
  } catch (rejRes) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Too many account creation attempts. Please try again later.'
    )
  }
  
  // ... rest of the existing code
})
```

#### B. Add Better Error Handling
Update the signup form to provide better feedback:

```typescript
// In apps/web/components/views/signup/steps/SignUpForm.tsx
catch (error) {
  if (error.code === 'auth/too-many-requests') {
    setFieldError('general', 'Too many attempts. Please try again later or contact support.')
  } else if (error.message.includes('blocked')) {
    setFieldError('general', 'Access temporarily blocked. Please contact support if this continues.')
  } else {
    setFieldError('general', error.message)
  }
}
```

#### C. Implement Account Verification
Add additional verification steps for new accounts:

```typescript
// Add to createNewUserAccount function
const userData: UserData = {
  // ... existing fields
  accountVerificationStatus: 'pending',
  accountCreatedAt: FieldValue.serverTimestamp() as Timestamp,
  lastLoginIP: request.rawRequest.ip,
  // ... rest of fields
}
```

### 3. User Resolution Steps
**For Blocked Users:**

1. **Wait Period**: The block is often temporary (24-48 hours)
2. **Different Network**: Try creating an account from a different IP address
3. **Different Device**: Use a different device or clear browser data completely
4. **Contact Support**: Reach out to your application's support team
5. **Alternative Auth**: If GitHub OAuth is blocked, try email/password signup

### 4. Monitoring and Prevention
**Add monitoring to detect patterns:**

```typescript
// Add to Firebase Functions
export const logAccountCreationAttempt = onCall(async (request) => {
  const clientIP = request.rawRequest.ip
  const userAgent = request.rawRequest.headers['user-agent']
  
  await firestore.collection('accountCreationLogs').add({
    ip: clientIP,
    userAgent,
    timestamp: FieldValue.serverTimestamp(),
    success: false,
    reason: 'blocked_by_firebase'
  })
})
```

## Best Practices Moving Forward

1. **Respect Rate Limits**: Don't create multiple accounts to bypass limits
2. **Upgrade Plans**: Consider upgrading to paid plans for legitimate use cases
3. **Monitor Usage**: Track account creation patterns to identify potential abuse
4. **Clear Communication**: Provide clear error messages and support contacts

## Testing the Solution

1. **Test Rate Limiting**: Verify that rate limiting works correctly
2. **Test Error Handling**: Ensure error messages are user-friendly
3. **Test Recovery**: Verify that legitimate users can recover after temporary blocks

## Support Contacts

- **Firebase Support**: Use Firebase Console → Support
- **Application Support**: [Add your support contact details]

## Additional Resources

- [Firebase Auth Security Best Practices](https://firebase.google.com/docs/auth/web/auth-security)
- [Firebase Auth Error Codes](https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#error-codes)
- [Rate Limiting with Firebase Functions](https://firebase.google.com/docs/functions/rate-limiting)

---

**Note**: This block is primarily a security feature to protect against abuse. While it may be inconvenient, it helps maintain the integrity of the authentication system for all users.