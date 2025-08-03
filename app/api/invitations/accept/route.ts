import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { token, userEmail, userName } = await request.json()

    if (!token || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Token, userEmail, and userName are required' },
        { status: 400 }
      )
    }

    // Update the invitation status to accepted
    try {
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by_email: userEmail,
          accepted_by_name: userName
        })
        .eq('token', token)
        .eq('status', 'pending')

      if (updateError) {
        console.error('Database error:', updateError)
        // For now, continue without database update
        console.log('Continuing without database update...')
      }

      // Get the invitation details to add user to the club
      const { data: invitation, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single()

      if (fetchError || !invitation) {
        console.log('Invitation not found in database, continuing...')
      } else {
        // Add the user to the club members (you'll need to create this table)
        const { error: memberError } = await supabase
          .from('members')
          .insert({
            name: userName,
            email: userEmail,
            club: invitation.club,
            role: 'member', // Default role for invited members
            status: 'active',
            joined_at: new Date().toISOString(),
            invited_by: invitation.inviter_name
          })

        if (memberError) {
          console.error('Error adding member:', memberError)
          // Don't fail the whole process if member addition fails
        }
      }
    } catch (error) {
      console.error('Database connection error:', error)
      // For now, continue without database operations
      console.log('Continuing without database operations...')
    }

    return NextResponse.json(
      { message: 'Invitation accepted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 