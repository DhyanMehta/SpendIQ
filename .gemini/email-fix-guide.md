# Email Service Fix Guide

## Current Issues

1. **Gmail SMTP Connection Timeout** - `ETIMEDOUT 192.178.211.108:587`
2. **Possible Resend remnants** (though not in code)

## Solutions Applied

### 1. Updated Mail Service Configuration

- ✅ Added TLS settings for better compatibility
- ✅ Added connection timeouts (10 seconds)
- ✅ Added SMTP verification on startup
- ✅ Disabled certificate validation for development

### 2. Gmail SMTP Troubleshooting

The timeout error suggests Gmail SMTP is being blocked. Here are possible causes:

#### **A. Firewall/Antivirus Blocking**

Your firewall or antivirus might be blocking outgoing SMTP connections on port 587.

**Solution:**

1. Temporarily disable firewall/antivirus
2. Test if emails work
3. If yes, add exception for Node.js/port 587

#### **B. Gmail App Password Issue**

The app password might be invalid or expired.

**Solution:**

1. Go to: https://myaccount.google.com/apppasswords
2. Delete old app password
3. Create new app password
4. Update `.env` with new password

#### **C. Gmail 2-Step Verification**

App passwords only work if 2-Step Verification is enabled.

**Solution:**

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Then create app password

#### **D. Network/ISP Blocking**

Some ISPs block port 587 for SMTP.

**Solution - Use Port 465 (SSL):**
Update `.env`:

```env
MAIL_PORT=465
```

Update `mail.service.ts` line 13:

```typescript
secure: true, // Change to true for port 465
```

#### **E. Use Alternative SMTP Service**

If Gmail continues to fail, use a dedicated email service.

**Option 1: SendGrid (Free tier: 100 emails/day)**

```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=<your-sendgrid-api-key>
MAIL_FROM="SpendIQ <your-verified-email@domain.com>"
```

**Option 2: Mailgun (Free tier: 5,000 emails/month)**

```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USER=<your-mailgun-smtp-username>
MAIL_PASSWORD=<your-mailgun-smtp-password>
MAIL_FROM="SpendIQ <your-verified-email@domain.com>"
```

**Option 3: Mailtrap (For Testing Only)**

```env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=<your-mailtrap-username>
MAIL_PASSWORD=<your-mailtrap-password>
MAIL_FROM="SpendIQ <test@example.com>"
```

## Testing Steps

1. **Restart API Server:**

   ```bash
   # Stop current server (Ctrl+C)
   npm run start:api
   ```

2. **Check Console for:**

   ```
   [MailService] ✅ SMTP server is ready to send emails
   ```

3. **If you see error:**

   ```
   [MailService] ❌ SMTP connection failed: <error details>
   ```

   Then follow troubleshooting steps above.

4. **Test Registration:**
   - Go to registration page
   - Enter email
   - Check console for OTP
   - Check email inbox

## Quick Fix: Use Mailtrap for Development

If you just need emails to work for development/testing:

1. **Sign up:** https://mailtrap.io (free)
2. **Get credentials** from inbox settings
3. **Update `.env`:**
   ```env
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USER=<from-mailtrap>
   MAIL_PASSWORD=<from-mailtrap>
   MAIL_FROM="SpendIQ <test@example.com>"
   ```
4. **Restart API server**
5. **View emails** in Mailtrap inbox (not real inbox)

## Current Configuration

Your `.env` currently has:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=krishilagrawal026@gmail.com
MAIL_PASSWORD=gwuk yjce zjoc rqaf
MAIL_FROM="SpendIQ <krishilagrawal026@gmail.com>"
```

## Recommended Next Steps

1. ✅ **Try Port 465** (SSL instead of TLS)
2. ✅ **Verify Gmail App Password** is correct
3. ✅ **Check Firewall** settings
4. ✅ **Use Mailtrap** for development testing
5. ✅ **Use SendGrid/Mailgun** for production

---

**Note:** The OTP is always logged to console, so users can still register even if email fails!
