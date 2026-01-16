# Setup Instructions for Parity+ Application

## Prerequisites

You need to have **Node.js** installed on your system to run this application.

## Step 1: Install Node.js

1. **Download Node.js** (LTS version recommended):
   - Visit: https://nodejs.org/
   - Download the Windows Installer (.msi) for the LTS version
   - Run the installer and follow the setup wizard
   - Make sure to check "Add to PATH" during installation

2. **Verify Installation**:
   Open a new PowerShell or Command Prompt window and run:
   ```bash
   node --version
   npm --version
   ```
   Both commands should return version numbers.

## Step 2: Install Dependencies

Once Node.js is installed, navigate to this project directory and run:

```bash
npm install
```

This will install all required dependencies (React, Vite, Tailwind CSS, etc.)

## Step 3: Start the Development Server

Run the following command:

```bash
npm run dev
```

The application will start and you'll see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 4: Open in Browser

Open your web browser and navigate to:
**http://localhost:5173**

You should now see the Parity+ application running locally!

## Troubleshooting

### If npm is not recognized:
- Make sure Node.js is installed
- Close and reopen your terminal/PowerShell window
- Verify Node.js is in your PATH: `echo $env:PATH` (PowerShell) or `echo %PATH%` (CMD)

### If port 5173 is already in use:
- The dev server will automatically try the next available port
- Check the terminal output for the actual port number

### If you encounter dependency errors:
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Need Help?

If you continue to have issues, please ensure:
1. Node.js version 18 or higher is installed
2. You're running commands from the project root directory
3. Your internet connection is active (for downloading packages)



