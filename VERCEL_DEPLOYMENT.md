# Vercel Deployment Guide for Persona Shard

This guide provides step-by-step instructions for deploying the Persona Shard FHEVM mental health survey application to Vercel.

## 🚀 Quick Deployment

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **WalletConnect Project**: Create a project at [WalletConnect Cloud](https://cloud.walletconnect.com/)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/water4699/persona-shard)

## 📋 Manual Deployment Steps

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Search for and select `persona-shard`
5. Click **"Import"**

### Step 2: Configure Project Settings

#### Basic Configuration
- **Framework Preset**: `Vite` (or `Other` if Vite is not auto-detected)
- **Root Directory**: Leave empty (configured in vercel.json)
- **Build Command**: Leave empty (configured in vercel.json)
- **Output Directory**: Leave empty (configured in vercel.json)
- **Install Command**: Leave empty (configured in vercel.json)

#### Frontend Package.json Configuration

The `frontend/package.json` includes rollup overrides to fix native binary issues:

```json
{
  "overrides": {
    "rollup": {
      "@rollup/rollup-linux-x64-gnu": "npm:@rollup/rollup-linux-x64-musl@4.34.8"
    }
  }
}
```

#### Monorepo Configuration

For monorepo setups, we use separate `vercel.json` files:

**Root `vercel.json`:**
```json
{
  "installCommand": "npm install",
  "framework": null
}
```

**Frontend `vercel.json` (in `frontend/` directory):**
```json
{
  "buildCommand": "npm install && npx vite build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 3: Set Environment Variables

Navigate to **Project Settings → Environment Variables** and add:

#### Required Variables

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

#### Optional Variables

```bash
VITE_SEPOLIA_RPC_URL=https://your-custom-sepolia-rpc-url
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at `your-project.vercel.app`

## 🔧 Environment Variables Guide

### WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID
4. Add it as `VITE_WALLETCONNECT_PROJECT_ID` in Vercel

### Custom RPC URL (Optional)

If you want to use a custom Sepolia RPC endpoint:

```bash
VITE_SEPOLIA_RPC_URL=https://your-preferred-sepolia-rpc.com
```

## 🐛 Troubleshooting

### Build Failures

**Error**: `Build failed`
```
Solution:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are listed in package.json
3. Try building locally: `cd frontend && npm run build`
```

**Error**: `Cannot resolve dependency`
```
Solution:
1. Check that all packages are published on npm
2. Ensure correct package versions in package.json
3. Clear npm cache: `npm cache clean --force`
```

### Runtime Errors

**Error**: `WalletConnect project ID is required`
```
Solution:
1. Check that VITE_WALLETCONNECT_PROJECT_ID is set
2. Ensure it starts with VITE_ prefix
3. Redeploy after adding the variable
```

**Error**: `Failed to connect to network`
```
Solution:
1. Check Sepolia RPC URL is accessible
2. Verify contract addresses are correct
3. Check browser console for detailed errors
```

### Performance Issues

**Slow loading times**:
```
Solution:
1. Enable Vercel Analytics for monitoring
2. Check bundle size: `npm run build && ls -lh dist/assets/`
3. Consider code splitting for large components
```

## 🌐 Custom Domain Setup

1. Go to **Project Settings → Domains**
2. Click **"Add"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate to be issued

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Go to **Project Settings → Analytics**
2. Enable Vercel Analytics
3. Monitor performance metrics

### Error Tracking
1. Check **Functions** tab for serverless function errors
2. Use browser developer tools for client-side errors
3. Enable error logging in your application

## 🔄 Updates & Redeployment

### Automatic Deployments
- Push to `main` branch triggers automatic deployment
- Check deployment status in Vercel dashboard

### Manual Redeployment
1. Go to your project dashboard
2. Click **"Deployments"** tab
3. Click **"Redeploy"** next to latest deployment

## 📞 Support

If you encounter issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Persona Shard Issues](https://github.com/water4699/persona-shard/issues)
3. Check browser console for detailed error messages

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Custom domain set up (optional)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Contract deployed to mainnet (for production)
- [ ] Analytics enabled
- [ ] Error monitoring set up
- [ ] Performance tested
- [ ] Mobile responsiveness verified

---

**Happy deploying! 🚀**

For more information about the Persona Shard application, see the main [README.md](README.md).
