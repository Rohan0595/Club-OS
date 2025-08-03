# Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, make sure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Supabase Project** (Optional): For full database functionality

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your Club OS project

### 2. Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables (for basic functionality):
```
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_sender_email@example.com
BREVO_SENDER_NAME=Club OS
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

#### Optional Variables (for full database functionality):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. How to Get Environment Variables

#### Brevo (Email Service):
1. Go to [brevo.com](https://brevo.com)
2. Sign up/Login to your account
3. Go to **Settings → API Keys**
4. Copy your API key
5. Set sender email and name in your Brevo account

#### Supabase (Database - Optional):
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings → API**
4. Copy the **Project URL** and **anon public** key
5. Run the SQL schema from `supabase-schema.sql` in the SQL Editor

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Environment Variable Setup in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** tab
3. Click **Environment Variables**
4. Add each variable:
   - **Name**: `BREVO_API_KEY`
   - **Value**: Your Brevo API key
   - **Environment**: Production, Preview, Development
5. Repeat for all variables
6. Click **Save**

## Troubleshooting

### Build Errors

If you get build errors related to missing environment variables:

1. **Check Environment Variables**: Make sure all required variables are set in Vercel
2. **Redeploy**: After adding variables, redeploy your project
3. **Check Logs**: View build logs in Vercel dashboard for specific errors

### Email Not Working

1. **Verify Brevo API Key**: Check if the API key is correct
2. **Check Sender Email**: Ensure the sender email is verified in Brevo
3. **Check Logs**: Look at Vercel function logs for email errors

### Database Not Working

1. **Supabase Connection**: Verify Supabase URL and key are correct
2. **Database Schema**: Run the SQL schema in Supabase SQL Editor
3. **RLS Policies**: Ensure Row Level Security is properly configured

## Features by Configuration

### Basic Setup (Email Only):
- ✅ User registration and login
- ✅ Email invitations
- ✅ Welcome emails
- ⚠️ No database persistence (data lost on page refresh)

### Full Setup (Email + Database):
- ✅ User registration and login
- ✅ Email invitations
- ✅ Welcome emails
- ✅ Database persistence
- ✅ Member management
- ✅ Invitation tracking

## Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test locally first with `npm run dev`
4. Check the browser console for client-side errors 