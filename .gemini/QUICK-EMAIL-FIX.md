# 🚀 Quick Email Fix - Use Mailtrap for Development

## Problem

Gmail SMTP is being blocked by your network/firewall/ISP. Port 587 and 465 both timeout.

## ✅ SOLUTION: Use Mailtrap (Free, Works Instantly)

Mailtrap is a fake SMTP server for development. Emails won't go to real inboxes, but you can view them in Mailtrap's web interface.

### Step 1: Sign Up (30 seconds)

1. Go to: https://mailtrap.io/register/signup
2. Sign up with Google or Email
3. Verify your email

### Step 2: Get SMTP Credentials

1. After login, go to: **Email Testing** → **Inboxes** → **My Inbox**
2. Click **Show Credentials**
3. You'll see:
   ```
   Host: smtp.mailtrap.io
   Port: 2525 (or 587, 465)
   Username: <your-username>
   Password: <your-password>
   ```

### Step 3: Update Your `.env`

Replace the email configuration in `.env` with:

```env
# Email Configuration (Mailtrap - Development)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=<paste-your-mailtrap-username>
MAIL_PASSWORD=<paste-your-mailtrap-password>
MAIL_FROM="SpendIQ <noreply@spendiq.com>"
```

### Step 4: Restart API Server

```bash
# Stop current server (Ctrl+C)
npm run start:api
```

### Step 5: Test

1. Go to registration page
2. Enter any email (doesn't need to be real)
3. Check Mailtrap inbox to see the email!

## ✅ Benefits

- ✅ Works instantly (no network/firewall issues)
- ✅ See all emails in web interface
- ✅ Test email templates easily
- ✅ Free forever (100 emails/month)
- ✅ No domain verification needed

## 📧 Viewing Emails

- Go to: https://mailtrap.io/inboxes
- All emails sent by your app appear here
- You can see HTML preview, source code, spam score, etc.

## 🎯 For Production

When you deploy to production, switch back to:

- **SendGrid** (100 free emails/day)
- **Mailgun** (5,000 free emails/month)
- **AWS SES** (62,000 free emails/month)

---

**This is the recommended solution for development!** 🚀
