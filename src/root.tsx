import { component$, useStyles$, useContextProvider, $, useStore } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet, ServiceWorkerRegister } from '@builder.io/qwik-city';
import { createClient } from '@supabase/supabase-js';
import { supabaseContext, SupaContextProps } from '~/state/supabase';

import globalStyles from './global.css?inline';

// Components
import { RouterHead } from '~/components/router-head/router-head';

// supabase client
export const supabaseClient = import.meta.env.VITE_SUPABASE_URL ? createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
) : false


export default component$(() => {
  useStyles$(globalStyles);
  const supaContext = useStore<SupaContextProps>({
    client$: $(() => supabaseClient),
    user: false
  })

  useContextProvider(supabaseContext, supaContext);

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
      </head>
      <body lang="en" class="pb-20 dark:bg-gray-800">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
