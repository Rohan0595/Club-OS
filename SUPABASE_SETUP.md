# Supabase Setup for Club OS

This guide will help you set up Supabase as the database for Club OS.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `club-os`
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

1. In your project root, edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace the placeholder values with your actual Supabase credentials

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `supabase-schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

This will create:
- All necessary tables (clubs, users, members, tasks, events, messages)
- Indexes for better performance
- Row Level Security (RLS) policies
- Sample data for testing

## 5. Database Tables Overview

### Clubs Table
- Stores club information (name, color, member count)
- Referenced by other tables

### Users Table
- Stores user authentication and profile data
- Links to clubs

### Members Table
- Stores club membership information
- Includes task assignment permissions

### Tasks Table
- Stores all task information
- Includes status, priority, assignee, due date

### Events Table
- Stores club events and activities
- Includes date, attendees, status

### Messages Table
- Stores chat messages
- Supports both group and individual chats

## 6. Row Level Security (RLS)

The database includes RLS policies for security:

- **Clubs**: Read access for all authenticated users
- **Users**: Read access to own data and club members
- **Members**: Read access for all authenticated users
- **Tasks**: Read access for all, write access for admins/presidents
- **Events**: Read access for all, write access for admins/presidents
- **Messages**: Read/write access for all authenticated users

## 7. Features Included

### Automatic Member Count Updates
- Trigger automatically updates club member count when members are added/removed

### Sample Data
- Pre-populated with Tech Club, Cultural Society, and Sports Club
- Sample users, members, tasks, and events
- Ready for immediate testing

### Performance Optimizations
- Indexes on frequently queried columns
- Optimized for club-based queries

## 8. Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Use these test credentials:
   - **Email**: `rahul@techclub.com`
   - **Password**: `tech123`
   - **Role**: President of Tech Club

## 9. Real-time Features

The database is set up to support:
- Real-time task updates
- Live messaging
- Member management
- Event planning

## 10. Next Steps

After setup, you can:
1. Customize the sample data
2. Add more clubs and members
3. Implement real-time subscriptions
4. Add file upload functionality
5. Set up email notifications

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Restart your development server after updating `.env.local`
   - Ensure variable names start with `NEXT_PUBLIC_`

2. **Database Connection Errors**
   - Verify your Supabase URL and key are correct
   - Check that your project is active in Supabase dashboard

3. **RLS Policy Errors**
   - Ensure you're authenticated when making requests
   - Check that your user has the correct role permissions

4. **Schema Errors**
   - Run the SQL schema in the correct order
   - Check for any syntax errors in the SQL file

### Support

If you encounter issues:
1. Check the Supabase documentation
2. Review the browser console for error messages
3. Verify your database schema matches the expected structure 