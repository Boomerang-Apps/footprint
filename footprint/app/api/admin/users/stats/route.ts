/**
 * GET /api/admin/users/stats
 *
 * Admin endpoint to get user statistics.
 * Only accessible by users with admin role.
 *
 * Response:
 * {
 *   totalUsers: number,
 *   newThisWeek: number,
 *   newThisMonth: number,
 *   adminCount: number,
 *   activeUsers: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

interface UserStatsResponse {
  totalUsers: number;
  newThisWeek: number;
  newThisMonth: number;
  adminCount: number;
  activeUsers: number;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<UserStatsResponse | ErrorResponse>> {
  try {
    // 1. Rate limiting
    const rateLimitResult = await checkRateLimit('general', request);
    if (rateLimitResult) {
      return rateLimitResult as NextResponse<ErrorResponse>;
    }

    // 2. Authentication check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 3. Admin authorization check
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 4. Fetch stats using RPC function
    // This assumes a database function exists or we query directly
    const { data: stats, error: queryError } = await supabase.rpc('get_admin_user_stats');

    if (queryError) {
      console.error('Admin user stats query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch user stats' },
        { status: 500 }
      );
    }

    // If RPC doesn't exist, we can compute stats directly
    if (!stats) {
      // Fallback: compute stats with multiple queries
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        { count: totalUsers },
        { count: newThisWeek },
        { count: newThisMonth },
        { count: adminCount },
        { count: activeUsers },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo.toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', oneMonthAgo.toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .eq('is_admin', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
      ]);

      return NextResponse.json({
        totalUsers: totalUsers || 0,
        newThisWeek: newThisWeek || 0,
        newThisMonth: newThisMonth || 0,
        adminCount: adminCount || 0,
        activeUsers: activeUsers || 0,
      });
    }

    // 5. Return stats from RPC
    return NextResponse.json({
      totalUsers: stats.totalUsers || stats.total_users || 0,
      newThisWeek: stats.newThisWeek || stats.new_this_week || 0,
      newThisMonth: stats.newThisMonth || stats.new_this_month || 0,
      adminCount: stats.adminCount || stats.admin_count || 0,
      activeUsers: stats.activeUsers || stats.active_users || 0,
    });

  } catch (error) {
    console.error('Admin user stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
