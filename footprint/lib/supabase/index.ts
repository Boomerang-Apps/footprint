// Browser client (for use in client components)
export { createClient as createBrowserClient, getSupabaseClient } from './client';

// Server client (for use in server components and API routes)
export { createClient as createServerClient, createAdminClient } from './server';
