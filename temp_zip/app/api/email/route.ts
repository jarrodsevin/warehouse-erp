import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    // Initialize Resend inside the function, not at module level
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { to, subject, html, attachments } = await request.json();
    
    const { data, error } = await resend.emails.send({
      from: 'Warehouse ERP <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
      attachments: attachments
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}