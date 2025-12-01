# Token Verification Guide

This document explains how to verify access tokens in the API server.

## Overview

The API server supports three types of token verification:

1. **JWT Tokens** - Our own JWT tokens issued after OAuth authentication
2. **OAuth Tokens** - Direct verification of Google/GitHub OAuth access tokens
3. **Hybrid** - Automatically tries JWT first, then OAuth if JWT fails

## Middleware Options

### 1. `verifyToken` (Recommended)

Automatically verifies either JWT or OAuth tokens.

```typescript
import { verifyToken } from "../middlewares/auth.middlewares";

router.get("/protected", verifyToken, (req, res) => {
  // req.user contains the authenticated user
  res.json({ user: req.user });
});
```

**Usage:**

```bash
# With JWT token
curl -H "Authorization: Bearer <jwt-token>" http://localhost:8000/api/user/me

# With OAuth token (auto-detects provider)
curl -H "Authorization: Bearer <oauth-token>" http://localhost:8000/api/user/me

# With OAuth token (specify provider)
curl -H "Authorization: Bearer <oauth-token>" \
     -H "X-Auth-Provider: GOOGLE" \
     http://localhost:8000/api/user/me
```

### 2. `verifyJWT`

Only verifies JWT tokens issued by our server.

```typescript
import { verifyJWT } from "../middlewares/auth.middlewares";

router.get("/protected", verifyJWT, (req, res) => {
  res.json({ user: req.user });
});
```

**Usage:**

```bash
curl -H "Authorization: Bearer <jwt-token>" http://localhost:8000/api/user/profile
```

### 3. `verifyOAuth`

Only verifies OAuth tokens from Google/GitHub.

```typescript
import { verifyOAuth } from "../middlewares/auth.middlewares";

router.get("/protected", verifyOAuth, (req, res) => {
  res.json({ user: req.user });
});
```

**Usage:**

```bash
# Auto-detect provider
curl -H "Authorization: Bearer <oauth-token>" http://localhost:8000/api/user/oauth-profile

# Specify provider explicitly
curl -H "Authorization: Bearer <oauth-token>" \
     -H "X-Auth-Provider: GITHUB" \
     http://localhost:8000/api/user/oauth-profile
```

## Token Verification Process

### JWT Token Verification

1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature using `JWT_SECRET`
3. Looks up user in database by `userId` from token payload
4. Attaches user to `req.user`

### OAuth Token Verification

1. Extracts token from `Authorization: Bearer <token>` header
2. Optionally reads `X-Auth-Provider` header (GOOGLE or GITHUB)
3. Verifies token with provider's API:
   - **Google**: Calls `https://www.googleapis.com/oauth2/v1/tokeninfo`
   - **GitHub**: Calls `https://api.github.com/user` and `https://api.github.com/user/emails`
4. Looks up user in database by email from token
5. Attaches user to `req.user`

## Example Routes

See `src/routes/user.routes.ts` for example implementations:

- `GET /api/user/me` - Uses `verifyToken` (supports both JWT and OAuth)
- `GET /api/user/profile` - Uses `verifyJWT` (JWT only)
- `GET /api/user/oauth-profile` - Uses `verifyOAuth` (OAuth only)

## Error Responses

All verification middlewares return `401 Unauthorized` with the following messages:

- `"Unauthorized"` - No authorization header or token provided
- `"Invalid or expired token"` - Token verification failed
- `"Email not found in token"` - OAuth token doesn't contain email
- `"User not found"` - User doesn't exist in database
- `"Token verification failed"` - General verification error

## Best Practices

1. **Use `verifyToken`** for most routes - it's the most flexible
2. **Use `verifyJWT`** when you only want to accept your own JWT tokens
3. **Use `verifyOAuth`** when you need to verify OAuth tokens directly
4. Always check `req.user` exists before using it
5. Consider issuing JWT tokens after OAuth for better performance (avoids external API calls)
