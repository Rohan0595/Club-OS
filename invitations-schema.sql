-- Create invitations table (matches supabase-schema.sql)
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

-- Create members table (matches supabase-schema.sql)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  club VARCHAR(255) NOT NULL,
  role VARCHAR(100) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by VARCHAR(255),
  avatar VARCHAR(500) DEFAULT '/placeholder-user.jpg',
  can_assign_tasks BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_members_club ON public.members(club);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);

-- Enable Row Level Security
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow read access to invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow write access to invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow read access to members" ON public.members;

-- Create RLS policies
CREATE POLICY "Allow read access to invitations" ON public.invitations
    FOR SELECT USING (true);

CREATE POLICY "Allow write access to invitations" ON public.invitations
    FOR ALL USING (true);

CREATE POLICY "Allow read access to members" ON public.members
    FOR SELECT USING (true);

-- Add comments for documentation
COMMENT ON TABLE invitations IS 'Stores club member invitations with unique tokens';
COMMENT ON TABLE members IS 'Stores club members with their roles and permissions';
COMMENT ON COLUMN invitations.token IS 'Unique invitation token used in email links';
COMMENT ON COLUMN invitations.status IS 'Invitation status: pending, accepted, or expired';
COMMENT ON COLUMN invitations.expires_at IS 'When the invitation expires (7 days from creation)';
COMMENT ON COLUMN members.can_assign_tasks IS 'Whether this member can assign tasks to others'; 