/**
 * GET /api/admin/users
 *
 * Admin endpoint to list all users with search, filtering, sorting, and pagination.
 * Only accessible by users with admin role.
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search by email or name (case-insensitive)
 * - role: Filter by role (all, admin, user)
 * - registeredFrom: Filter users registered after this date (ISO format)
 * - registeredTo: Filter users registered before this date (ISO format)
 * - sortBy: Sort field (created_at, name, order_count)
 * - sortOrder: Sort direction (asc, desc)
 *
 * Response:
 * {
 *   users: AdminUserSummary[],
 *   total: number,
 *   page: number,
 *   limit: number,
 *   totalPages: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Valid role filters
const VALID_ROLES = ['all', 'admin', 'user'];

// Valid sort fields (whitelist for security)
const VALID_SORT_FIELDS = ['created_at', 'name', 'order_count', 'email'];

interface AdminUserSummary {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  preferredLanguage: 'he' | 'en';
  isAdmin: boolean;
  status: string;
  orderCount: number;
  totalSpent: number; // in ILS
  lastOrderDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersResponse {
  users: AdminUserSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ErrorResponse {
  error: string;
}

/**
 * Converts price from agorot (stored in DB) to ILS
 */
function convertFromAgorot(agorot: number): number {
  return Math.round(agorot / 100 * 100) / 100;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<AdminUsersResponse | ErrorResponse>> {
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

    // 4. Parse query parameters
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search');
    const role = searchParams.get('role') || 'all';
    const registeredFrom = searchParams.get('registeredFrom');
    const registeredTo = searchParams.get('registeredTo');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 5. Validate parameters
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Valid values: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!VALID_SORT_FIELDS.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sort field. Valid values: ${VALID_SORT_FIELDS.join(', ')}` },
        { status: 400 }
      );
    }

    // 6. Build query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        phone,
        avatar_url,
        preferred_language,
        is_admin,
        status,
        created_at,
        updated_at,
        order_count,
        total_spent,
        last_order_date
      `, { count: 'exact' });

    // Apply search filter (email or name)
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Apply role filter
    if (role === 'admin') {
      query = query.eq('is_admin', true);
    } else if (role === 'user') {
      query = query.eq('is_admin', false);
    }

    // Apply date range filters
    if (registeredFrom) {
      query = query.gte('created_at', `${registeredFrom}T00:00:00.000Z`);
    }

    if (registeredTo) {
      query = query.lte('created_at', `${registeredTo}T23:59:59.999Z`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // 7. Execute query
    const { data: users, error: queryError, count } = await query;

    if (queryError) {
      console.error('Admin users query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // 8. Transform response to camelCase
    const transformedUsers: AdminUserSummary[] = (users || []).map((user: Record<string, unknown>) => ({
      id: user.id as string,
      email: user.email as string,
      name: user.name as string | null,
      phone: user.phone as string | null,
      avatarUrl: user.avatar_url as string | null,
      preferredLanguage: (user.preferred_language as 'he' | 'en') || 'he',
      isAdmin: user.is_admin as boolean,
      status: (user.status as string) || 'active',
      orderCount: (user.order_count as number) || 0,
      totalSpent: convertFromAgorot((user.total_spent as number) || 0),
      lastOrderDate: user.last_order_date as string | null,
      createdAt: user.created_at as string,
      updatedAt: user.updated_at as string,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: transformedUsers,
      total,
      page,
      limit,
      totalPages,
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
