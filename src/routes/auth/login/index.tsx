import type { RequestHandler } from "@builder.io/qwik-city";
import { createClient } from '@supabase/supabase-js';

// supabase client
export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

export const onPost: RequestHandler<any> = async({params, request}) => {
    const body: { user: { email: string } } = await request.json();
    const { user: { email } } = body;

    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'http://localhost:5173/auth/callback'
        }
      })

    if(error) {
        throw error;
    }
    return {
        email,
        params,
        data
    }
}