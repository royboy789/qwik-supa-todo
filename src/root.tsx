import { component$, useStyles$, useContextProvider, $, useStore, useClientEffect$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet, ServiceWorkerRegister } from '@builder.io/qwik-city';
import { createClient } from '@supabase/supabase-js';
import { supabaseContext, SupaContextProps } from '~/state/supabase';

import globalStyles from './global.css?inline';

// Components
import { RouterHead } from '~/components/router-head/router-head';

// supabase client
export const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);



export default component$(() => {
  useStyles$(globalStyles);
  const supaContext = useStore<SupaContextProps>({
    client$: $(() => supabaseClient),
    user: false
  })

  useClientEffect$(async({track}) => {
    track(() => supaContext);
    const client = await supaContext.client$();
    
    // get session from supa
    const { data: userSession, error } = await client.auth.getSession();
    if( error ) {
      console.error(error);
    }
    
    // set user
    if(userSession.session) {
      supaContext.user = userSession.session.user;
    } else {
      console.log('not logged in');
    }
  })

  useContextProvider(supabaseContext, supaContext);

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
