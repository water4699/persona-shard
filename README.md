# Persona Shard

Encrypted Mental Health Survey DApp using Fully Homomorphic Encryption (FHEVM)

## Overview

Persona Shard is a decentralized application that enables privacy-preserving mental health surveys using Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM). Users can submit survey responses that are encrypted on-chain, and only they can decrypt their own results.

## Features

- **Privacy-Preserving Surveys**: All survey responses are encrypted using FHEVM
- **Decentralized**: Built on Ethereum-compatible blockchains
- **User-Controlled Decryption**: Only survey creators can decrypt their responses
- **Multi-Network Support**: Works on both local Hardhat network and Sepolia testnet

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Solidity smart contracts
- **Encryption**: Zama FHEVM (@zama-fhe/relayer-sdk)
- **Blockchain**: Hardhat + Ethers.js
- **Wallet**: RainbowKit + Wagmi

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/water4699/persona-shard.git
cd persona-shard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# frontend/.env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Local Development

1. Start local Hardhat node:
```bash
npm run local
```

2. Deploy contracts:
```bash
npm run deploy:local
```

3. Start frontend:
```bash
cd frontend
npm run dev
```

### Testnet Deployment

1. Deploy to Sepolia:
```bash
npm run deploy:sepolia
```

2. Update contract addresses in frontend config

### Vercel Deployment

Persona Shard can be easily deployed to Vercel for production hosting.

#### Prerequisites

- [Vercel account](https://vercel.com)
- [WalletConnect Cloud project](https://cloud.walletconnect.com/) (for wallet connections)

#### Environment Variables

Set these environment variables in your Vercel project settings:

```bash
# WalletConnect Project ID (required)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Optional: Custom Sepolia RPC URL
VITE_SEPOLIA_RPC_URL=https://your-custom-sepolia-rpc-url
```

#### Deployment Steps

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your `persona-shard` repository from GitHub

2. **Configure Build Settings**:
   - **Framework Preset**: `Other` (since we use Vite)
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add `VITE_WALLETCONNECT_PROJECT_ID`
   - Optional: Add `VITE_SEPOLIA_RPC_URL`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

#### Custom Domain (Optional)

To use a custom domain:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

#### Build Configuration Details

The `vercel.json` file in the root directory configures:

```json
{
  "buildCommand": "bash -c 'cd frontend && npm run build'",
  "outputDirectory": "frontend/dist",
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

This tells Vercel:
- Install dependencies in the root directory
- Run build command in the frontend directory using bash
- Serve the built files from `frontend/dist/`
- Handle client-side routing with SPA fallback

#### Troubleshooting Vercel Deployment

**Build Failures**:
- Ensure all environment variables are set correctly
- Check that `VITE_WALLETCONNECT_PROJECT_ID` is properly configured
- Verify that the build completes locally: `cd frontend && npm run build`

**Runtime Errors**:
- Check browser console for any missing environment variables
- Ensure contract addresses are correct for the target network
- Verify that the Sepolia RPC URL is accessible

**Environment Variables Not Working**:
- Remember that all env vars must start with `VITE_` to be accessible in the frontend
- Redeploy after adding new environment variables
- Check Vercel function logs for any issues

## Project Structure

```
persona-shard/
├── contracts/           # Solidity smart contracts
├── frontend/           # React frontend application
├── test/               # Contract tests
├── tasks/              # Hardhat tasks
├── deploy/             # Deployment scripts
└── types/              # TypeScript type definitions
```

## Architecture

The application consists of:

1. **Smart Contracts**: Handle encrypted survey submissions and storage
2. **Frontend**: User interface for creating and decrypting surveys
3. **FHEVM Integration**: Client-side encryption/decryption using Zama SDK

## Security

- All survey data is encrypted using Fully Homomorphic Encryption
- Private keys never leave the user's browser
- Only survey creators can decrypt their own responses

## License

MIT License - see LICENSE file for details
