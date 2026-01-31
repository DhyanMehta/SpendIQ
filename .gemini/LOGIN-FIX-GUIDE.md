# Login Issue - Quick Fix Guide

## Problem

Unable to sign in to the dashboard. This is likely due to Prisma Client not being regenerated after schema changes.

## ✅ Immediate Solution

### Step 1: Stop All Processes

Close all terminal windows running:

- `npm run dev`
- `npm run start:api`

Or run:

```powershell
taskkill /F /IM node.exe
```

### Step 2: Delete Prisma Client Cache

```powershell
Remove-Item -Recurse -Force node_modules\.prisma
```

### Step 3: Regenerate Prisma Client

```powershell
npx prisma generate --schema packages/database/schema.prisma
```

### Step 4: Restart Servers

```powershell
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend API
npm run start:api
```

### Step 5: Test Login

1. Go to http://localhost:3000/login (or 3001 if port 3000 is in use)
2. Use existing credentials or register a new account
3. Try logging in

## Current Server Status

- **Frontend**: Running on port 3001 (port 3000 was in use)
- **Backend API**: Starting on port 4000

## If Still Not Working

### Check API Server is Running

```powershell
# Should show port 4000 listening
netstat -ano | findstr :4000
```

### Check for Errors in API Logs

Look for errors in the terminal running `npm run start:api`

### Verify Database Connection

Check `.env` file has correct `DATABASE_URL`

### Test API Directly

```powershell
# Should return "Hello World" or similar
curl http://localhost:4000
```

## Common Issues

### 1. Port Already in Use

**Error**: `EADDRINUSE`

**Fix**: Kill the process using the port

```powershell
# For port 4000
Get-NetTCPConnection -LocalPort 4000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### 2. Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Fix**: Follow Steps 2-3 above

### 3. File Lock on Prisma

**Error**: `EPERM: operation not permitted`

**Fix**:

1. Close VS Code
2. Delete `node_modules\.prisma` folder
3. Reopen VS Code
4. Run `npx prisma generate`

### 4. Database Migration Needed

**Error**: `Invalid prisma.budget.findMany() invocation`

**Fix**:

```powershell
npx prisma migrate dev --schema packages/database/schema.prisma
```

## Test Credentials

If you need to create a test account:

1. Go to `/register`
2. Fill in the form
3. Get OTP from console logs (development mode)
4. Complete registration
5. Use those credentials to login

## API Endpoints

- **Login**: `POST http://localhost:4000/auth/login`

  ```json
  {
    "loginId": "your_login_id",
    "password": "your_password"
  }
  ```

- **Register**: `POST http://localhost:4000/auth/register`
- **Profile**: `GET http://localhost:4000/auth/profile` (requires Bearer token)

## Next Steps

Once login is working:

1. Navigate to `/dashboard/budgets` to test Budget Master
2. Create a test budget
3. Confirm it and check actuals

---

**Need Help?** Check the API server logs for specific error messages.
