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

-- Enable Row Level Security
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

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

-- Insert sample data
INSERT INTO public.clubs (name, color, member_count) VALUES
    ('Tech Club', 'bg-blue-500', 3),
    ('Cultural Society', 'bg-purple-500', 2),
    ('Sports Club', 'bg-green-500', 2)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.users (name, email, role, club, avatar) VALUES
    ('Admin User', 'admin@clubos.com', 'admin', 'Tech Club', '/placeholder-user.jpg'),
    ('Rahul Kumar', 'rahul@techclub.com', 'president', 'Tech Club', '/placeholder-user.jpg'),
    ('Priya Sharma', 'priya@cultural.com', 'president', 'Cultural Society', '/placeholder-user.jpg'),
    ('Amit Singh', 'amit@sports.com', 'president', 'Sports Club', '/placeholder-user.jpg')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.members (name, role, email, avatar, club, status, can_assign_tasks) VALUES
    ('Rahul Kumar', 'President', 'rahul@techclub.com', '/placeholder-user.jpg', 'Tech Club', 'active', true),
    ('Priya Sharma', 'Vice President', 'priya@techclub.com', '/placeholder-user.jpg', 'Tech Club', 'active', true),
    ('Amit Singh', 'Secretary', 'amit@techclub.com', '/placeholder-user.jpg', 'Tech Club', 'active', false),
    ('Priya Sharma', 'President', 'priya@cultural.com', '/placeholder-user.jpg', 'Cultural Society', 'active', true),
    ('Sneha Patel', 'Vice President', 'sneha@cultural.com', '/placeholder-user.jpg', 'Cultural Society', 'active', false),
    ('Amit Singh', 'President', 'amit@sports.com', '/placeholder-user.jpg', 'Sports Club', 'active', true),
    ('Rajesh Kumar', 'Vice President', 'rajesh@sports.com', '/placeholder-user.jpg', 'Sports Club', 'active', false)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.tasks (title, description, assignee, status, priority, due_date, club) VALUES
    ('Organize Tech Fest', 'Plan and execute the annual technology festival including venue booking, speaker arrangements, and marketing materials.', 'Rahul Kumar', 'In Progress', 'High', '2024-02-15', 'Tech Club'),
    ('Design Club Poster', 'Create promotional materials for the upcoming club events including posters, social media graphics, and flyers.', 'Priya Sharma', 'Completed', 'Medium', '2024-02-10', 'Tech Club'),
    ('Book Auditorium', 'Reserve the main auditorium for upcoming club events and coordinate with the facilities department.', 'Amit Singh', 'Pending', 'Low', '2024-02-20', 'Tech Club'),
    ('Cultural Night Preparation', 'Organize and prepare for the annual cultural night event.', 'Priya Sharma', 'In Progress', 'High', '2024-02-25', 'Cultural Society'),
    ('Dance Competition', 'Plan and execute the inter-college dance competition.', 'Sneha Patel', 'Completed', 'Medium', '2024-02-12', 'Cultural Society'),
    ('Sports Tournament', 'Organize the annual sports tournament with multiple events.', 'Amit Singh', 'In Progress', 'High', '2024-03-01', 'Sports Club'),
    ('Equipment Maintenance', 'Maintain and update sports equipment inventory.', 'Rajesh Kumar', 'Pending', 'Low', '2024-02-18', 'Sports Club')
ON CONFLICT DO NOTHING;

INSERT INTO public.events (title, date, attendees, status, club) VALUES
    ('Annual Tech Symposium', '2024-03-15', 200, 'Upcoming', 'Tech Club'),
    ('Hackathon 2024', '2024-04-20', 150, 'Planning', 'Tech Club'),
    ('Cultural Night', '2024-02-28', 150, 'Planning', 'Cultural Society'),
    ('Dance Competition', '2024-03-10', 100, 'Upcoming', 'Cultural Society')
ON CONFLICT DO NOTHING;

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

-- Create trigger to automatically update member count
CREATE TRIGGER trigger_update_member_count
    AFTER INSERT OR DELETE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION update_club_member_count(); 