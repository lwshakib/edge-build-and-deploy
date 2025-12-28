# GitHub App Setup Guide

To enable multi-account repository access in Edge Build and Deploy, you need to create and configure a GitHub App.

## 1. Create the GitHub App

1. Go to your GitHub [Developer Settings](https://github.com/settings/apps).
2. Click **New GitHub App**.
3. **App Name**: Edge Build and Deploy (or your preference).
4. **Homepage URL**: `http://localhost:3000` (or your production URL).
5. **Callback URL**: `http://localhost:4000/api/github/callback` (CRITICAL: Must be /api/github/callback, NOT /api/auth/...)
6. **Setup URL**: `http://localhost:4000/api/github/callback`
7. **Webhook**: Uncheck "Active" for now (unless you want to handle real-time sync).

## 2. Permissions

Under **Repository permissions**, grant the following:

- **Contents**: Read-only (to access code).
- **Metadata**: Read-only (required for all apps).
- **Pull requests**: Read & write (optional, for automated deployments).
- **Commit statuses**: Read & write (to show build status).

Under **User permissions**:

- **Email addresses**: Read-only (to identify the user).

## 3. Installation

- **Where can this GitHub App be installed?**: Any account (allows multi-account support).

## 4. Generate Credentials

1. **Client ID**: Copy this to your `.env`.
2. **Client Secret**: Generate a new client secret and copy it to your `.env`.
3. **Private Key**: Scroll down and click **Generate a private key**. Save the `.pem` file. You will need to convert this to a string or base64 for your environment variables.
4. **App ID**: Copy this from the general settings page.

## 5. Environment Variables

Add these to your **server** `.env` file:

```env
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

## 6. Frontend Integration

The "Connect to GitHub" button should now point to:
`https://github.com/apps/{your-app-slug}/installations/new`
