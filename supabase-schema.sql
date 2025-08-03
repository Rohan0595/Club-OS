-- Enable Row Level Security

-- Create tables
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT 'bg-blue-500',
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'member',
    club TEXT REFERENCES public.clubs(name) ON DELETE SET NULL,
    avatar TEXT DEFAULT '/placeholder-user.jpg',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    email TEXT NOT NULL UNIQUE,
    avatar TEXT DEFAULT '/placeholder-user.jpg',
    club TEXT NOT NULL REFERENCES public.clubs(name) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'invited')),
    can_assign_tasks BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    assignee TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    due_date DATE NOT NULL,
    club TEXT NOT NULL REFERENCES public.clubs(name) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    attendees INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'Upcoming', 'Completed', 'Cancelled')),
    club TEXT NOT NULL REFERENCES public.clubs(name) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sender_avatar TEXT DEFAULT '/placeholder-user.jpg',
    sender_name TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table for the invitation system
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    club VARCHAR(255) NOT NULL,
    inviter_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by_email VARCHAR(255),
    accepted_by_name VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_club ON public.users(club);
CREATE INDEX IF NOT EXISTS idx_members_club ON public.members(club);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_tasks_club ON public.tasks(club);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_events_club ON public.events(club);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- Enable Row Level Security
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow read access to clubs" ON public.clubs;
DROP POLICY IF EXISTS "Allow users to read own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to read club members" ON public.users;
DROP POLICY IF EXISTS "Allow read access to members" ON public.members;
DROP POLICY IF EXISTS "Allow read access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow write access to tasks for admins" ON public.tasks;
DROP POLICY IF EXISTS "Allow read access to events" ON public.events;
DROP POLICY IF EXISTS "Allow write access to events for admins" ON public.events;
DROP POLICY IF EXISTS "Allow read access to messages" ON public.messages;
DROP POLICY IF EXISTS "Allow write access to messages" ON public.messages;
DROP POLICY IF EXISTS "Allow read access to invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow write access to invitations" ON public.invitations;

-- Create RLS policies
-- Clubs: Allow read access to all authenticated users
CREATE POLICY "Allow read access to clubs" ON public.clubs
    FOR SELECT USING (true);

-- Users: Allow users to read their own data and club members
CREATE POLICY "Allow users to read own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Allow users to read club members" ON public.users
    FOR SELECT USING (true);

-- Members: Allow read access to all authenticated users
CREATE POLICY "Allow read access to members" ON public.members
    FOR SELECT USING (true);

-- Tasks: Allow read access to club members, write access to admins
CREATE POLICY "Allow read access to tasks" ON public.tasks
    FOR SELECT USING (true);

CREATE POLICY "Allow write access to tasks for admins" ON public.tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND (users.role = 'admin' OR users.role = 'president')
        )
    );

-- Events: Allow read access to club members, write access to admins
CREATE POLICY "Allow read access to events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Allow write access to events for admins" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND (users.role = 'admin' OR users.role = 'president')
        )
    );

-- Messages: Allow read/write access to all authenticated users
CREATE POLICY "Allow read access to messages" ON public.messages
    FOR SELECT USING (true);

CREATE POLICY "Allow write access to messages" ON public.messages
    FOR INSERT WITH CHECK (true);

-- Invitations: Allow read/write access to all authenticated users
CREATE POLICY "Allow read access to invitations" ON public.invitations
    FOR SELECT USING (true);

CREATE POLICY "Allow write access to invitations" ON public.invitations
    FOR ALL USING (true);

-- No sample data - start fresh with user-created data

-- Create a function to update member count automatically
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clubs 
        SET member_count = member_count + 1 
        WHERE name = NEW.club;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clubs 
        SET member_count = member_count - 1 
        WHERE name = OLD.club;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS trigger_update_member_count ON public.members;

-- Create trigger to automatically update member count
CREATE TRIGGER trigger_update_member_count
    AFTER INSERT OR DELETE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION update_club_member_count(); 