import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get user's timeline using Supabase client directly
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: timeline, error: timelineError } = await supabase
      .from('user_timelines')
      .select(`
        *,
        timeline_milestones (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (timelineError || !timeline) {
      return NextResponse.json(
        { error: 'No active timeline found. Please complete the intake form first.' },
        { status: 404 }
      );
    }

    // Generate simple text-based timeline for now
    // In production, you would use a proper PDF library like @react-pdf/renderer
    const textContent = generateTextTimeline(timeline);

    // Return as plain text for now (can be converted to PDF later)
    return new Response(textContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="financial-timeline.txt"',
      },
    });
  } catch (error) {
    console.error('Timeline generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate timeline' },
      { status: 500 }
    );
  }
}

function generateTextTimeline(timeline: any): string {
  const lines: string[] = [];
  
  lines.push('YOUR FINANCIAL REBUILDING TIMELINE');
  lines.push('====================================');
  lines.push(`Generated on ${new Date().toLocaleDateString()}`);
  lines.push('');
  
  lines.push('YOUR PERSONALIZED PLAN');
  lines.push('----------------------');
  lines.push('This timeline is designed to help you rebuild your financial future step by step.');
  lines.push('Complete each milestone at your own pace. Remember, building financial health takes time and consistency.');
  lines.push('');
  
  lines.push('YOUR MILESTONES');
  lines.push('---------------');
  
  const milestones = timeline?.timeline_milestones || [];
  milestones.forEach((milestone: any) => {
    lines.push(`Month ${milestone.target_month}: ${milestone.title}`);
    lines.push(`Status: ${milestone.is_completed ? '✓ Completed' : '○ Pending'}`);
    lines.push(milestone.description);
    lines.push('');
  });
  
  lines.push('TIPS FOR SUCCESS');
  lines.push('----------------');
  lines.push('• Complete each step at your own pace - there\'s no rush');
  lines.push('• Reach out to local reentry organizations for support');
  lines.push('• Keep records of all your financial documents');
  lines.push('• Celebrate each milestone you achieve!');
  lines.push('');
  
  lines.push('BetterMinds Financial Rebuilding Platform');
  lines.push('This document is for educational purposes only and does not constitute financial or legal advice.');
  
  return lines.join('\n');
}