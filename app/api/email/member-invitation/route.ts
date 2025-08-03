import { NextRequest, NextResponse } from 'next/server'
import { sendMemberInvitationEmail } from '@/lib/brevo'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { inviteeEmail, inviteeName, clubName, inviterName } = await request.json()

    if (!inviteeEmail || !inviteeName || !clubName || !inviterName) {
      return NextResponse.json(
        { error: 'All fields are required: inviteeEmail, inviteeName, clubName, inviterName' },
        { status: 400 }
      )
    }

    // Check if email is already registered
    if (supabase) {
      try {
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('email')
          .eq('email', inviteeEmail)
          .single()

        if (memberData) {
          return NextResponse.json(
            { error: 'This email is already registered as a member' },
            { status: 400 }
          )
        }
      } catch (error) {
        // Email not found, continue with invitation
      }

      // Check if there's already a pending invitation for this email
      try {
        const { data: invitationData, error: invitationError } = await supabase
          .from('invitations')
          .select('email')
          .eq('email', inviteeEmail)
          .eq('status', 'pending')
          .single()

        if (invitationData) {
          return NextResponse.json(
            { error: 'This email already has a pending invitation' },
            { status: 400 }
          )
        }
      } catch (error) {
        // No pending invitation found, continue
      }
    } else {
      console.warn('Supabase not configured, skipping email uniqueness checks')
    }

    // Generate a unique invitation token
    const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store the invitation in the database (you'll need to create this table)
    if (supabase) {
      try {
        const { error: dbError } = await supabase
          .from('invitations')
          .insert({
            token: invitationToken,
            email: inviteeEmail,
            name: inviteeName,
            club: clubName,
            inviter_name: inviterName,
            status: 'pending',
            created_at: new Date().toISOString()
          })

        if (dbError) {
          console.error('Database error:', dbError)
          // For now, continue without database storage
          console.log('Continuing without database storage...')
        }
      } catch (error) {
        console.error('Database connection error:', error)
        // For now, continue without database storage
        console.log('Continuing without database storage...')
      }
    } else {
      console.warn('Supabase not configured, skipping invitation storage')
    }

    // Send the invitation email
    const result = await sendMemberInvitationEmail(
      inviteeEmail,
      inviteeName,
      clubName,
      inviterName,
      invitationToken
    )

    if (result.success) {
      return NextResponse.json(
        { 
          message: 'Member invitation sent successfully', 
          messageId: result.messageId,
          token: invitationToken 
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to send member invitation email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in member invitation email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 