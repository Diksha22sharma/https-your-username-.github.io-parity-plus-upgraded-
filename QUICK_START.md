# Quick Start Guide - View Parity+ Frontend Locally

## Step-by-Step Instructions

### Step 1: Install Node.js (if not already installed)

1. **Download Node.js**:
   - Go to: https://nodejs.org/
   - Click "Download Node.js (LTS)" - this is the recommended version
   - The file will be something like `node-v20.x.x-x64.msi`

2. **Install Node.js**:
   - Double-click the downloaded `.msi` file
   - Click "Next" through the installation wizard
   - **IMPORTANT**: Make sure "Add to PATH" is checked (it should be by default)
   - Click "Install" and wait for it to complete
   - Click "Finish"

3. **Verify Installation**:
   - Close and reopen your PowerShell/Command Prompt
   - Type: `node --version`
   - You should see something like: `v20.x.x`
   - Type: `npm --version`
   - You should see something like: `10.x.x`

### Step 2: Install Project Dependencies

1. **Open PowerShell or Command Prompt** in this project folder:
   - Right-click in the folder: `Cursor Parity`
   - Select "Open in Terminal" or "Open PowerShell window here"

2. **Run this command**:
   ```bash
   npm install
   ```
   - This will take 1-2 minutes to download all dependencies
   - Wait until you see: `added XXX packages`

### Step 3: Start the Development Server

1. **Run this command**:
   ```bash
   npm run dev
   ```

2. **You should see output like**:
   ```
   VITE v5.0.8  ready in 500 ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

### Step 4: View the Application

1. **Open your web browser** (Chrome, Edge, Firefox, etc.)

2. **Navigate to**: `http://localhost:5173`

3. **You should now see the Parity+ application!**

## What You'll See

- **Overview Page**: Dashboard with KPIs, charts, and insights
- **Reports Page**: Violations table with filters
- **Test Bookings Page**: Booking management interface
- **Statistics Page**: Analytics and visualizations
- **Settings Page**: Configuration options

Use the left navigation menu to switch between pages.

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Solution: Install Node.js (Step 1) and restart your terminal

### "Port 5173 is already in use"
- Another application is using that port
- Solution: The server will automatically use the next available port (check the terminal output)

### "Cannot find module"
- Dependencies not installed
- Solution: Run `npm install` again

### Need to Stop the Server
- Press `Ctrl + C` in the terminal where the server is running

## Need Help?

If you encounter any issues, make sure:
- ✅ Node.js is installed (check with `node --version`)
- ✅ You're in the correct project directory
- ✅ You've run `npm install` successfully
- ✅ Your internet connection is active



