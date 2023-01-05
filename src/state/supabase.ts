import { createContext, QRL } from "@builder.io/qwik";
import { SupabaseClient, User } from "@supabase/supabase-js";

const supabaseContextName = 'authContext';

export interface SupaContextProps {
    client$: QRL<() => SupabaseClient|false>;
    user: User | false;
}

export const supabaseContext = createContext<SupaContextProps>(supabaseContextName);
