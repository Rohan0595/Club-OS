import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, invitationToken } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // If Supabase is not configured, return false (allow signup)
    if (!supabase) {
      console.warn('Supabase not configured, allowing email signup')
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    // Check if email exists in members table
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('email')
        .eq('email', email)
        .single()

      if (memberData) {
        return NextResponse.json({ exists: true }, { status: 200 })
      }
    } catch (error) {
      // Email not found in members table, continue checking
    }

    // Check if email exists in invitations table (pending invitations)
    try {
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .select('email, token')
        .eq('email', email)
        .eq('status', 'pending')
        .single()

      if (invitationData) {
        // If this is the same invitation token, allow the email to be used
        if (invitationToken && invitationData.token === invitationToken) {
          return NextResponse.json({ exists: false }, { status: 200 })
        }
        
        return NextResponse.json({ 
          exists: true, 
          message: 'This email has a pending invitation. Please check your email for the invitation link.' 
        }, { status: 200 })
      }
    } catch (error) {
      // No pending invitation found
    }

    // For now, we'll only check the database tables
    // localStorage doesn't work on server-side, so we'll rely on database checks
    // In a real app, you'd have a proper users table in the database

    return NextResponse.json({ exists: false }, { status: 200 })

  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 