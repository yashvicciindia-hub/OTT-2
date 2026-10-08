import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfiguration {
  url: string;
  anonKey: string;
}

function readConfiguration(): { config?: SupabaseConfiguration; error?: string } {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url && !anonKey) {
    return {
      error: 'Supabase is unavailable because VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY were not set when this app was built.',
    };
  }
  if (!url || !anonKey) {
    return { error: 'Supabase configuration is incomplete. Set both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { error: 'VITE_SUPABASE_URL is not a valid URL. Use https://<project-ref>.supabase.co.' };
  }

  if (
    !['http:', 'https:'].includes(parsedUrl.protocol)
    || parsedUrl.username
    || parsedUrl.password
    || parsedUrl.search
    || parsedUrl.hash
    || (parsedUrl.pathname !== '' && parsedUrl.pathname !== '/')
  ) {
    return {
      error: 'VITE_SUPABASE_URL must be the project URL (https://<project-ref>.supabase.co), not a REST endpoint such as /rest/v1/.',
    };
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
    return { error: 'VITE_SUPABASE_URL must use HTTPS outside local development.' };
  }

  if (/service_role|sb_secret_/i.test(anonKey)) {
    return { error: 'VITE_SUPABASE_ANON_KEY must be a Supabase publishable or anon key. Never use a service-role or secret key in the frontend.' };
  }

  return { config: { url: parsedUrl.origin, anonKey } };
}

const configuration = readConfiguration();
export const supabaseConfigurationError = configuration.error ?? '';
export const isSupabaseConfigured = Boolean(configuration.config);

let client: SupabaseClient | null = null;
let initializationError = '';

if (configuration.config) {
  try {
    client = createClient(configuration.config.url, configuration.config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  } catch (error) {
    initializationError = error instanceof Error ? error.message : 'Unknown Supabase client initialization error.';
    console.error('Supabase client initialization failed.', error);
  }
}

export const supabaseInitializationError = initializationError;
export const supabase = client;
export const isSupabaseAvailable = client !== null;

export function requireSupabase(): SupabaseClient {
  if (!client) {
    const detail = supabaseInitializationError || supabaseConfigurationError || 'Supabase client initialization failed.';
    throw new Error(detail);
  }
  return client;
}

