import { component$, useStyles$, useContextProvider, $, useStore, useClientEffect$ } from '@builder.io/qwik';
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

  useClientEffect$(async({track}) => {
    track(() => supaContext);
    const client = await supaContext.client$();
    if(!client || supaContext.user) {
      return;
    }

    // find local store sb- key
    const localStoreKey = Object.keys(window.localStorage).find((key) => 0 === key.indexOf('sb-'));
    if(localStoreKey) {
      const localStoreSession = JSON.parse(window.localStorage.getItem(localStoreKey) || '{}');    
      if( localStoreSession.access_token && localStoreSession.refresh_token ) {
        document.cookie = `access_token=${localStoreSession.access_token}`;
        document.cookie = `refresh_token=${localStoreSession.refresh_token}`;
      }
    }
        
    // get session from supa
    const { data: userSession, error } = await client.auth.getSession();
    if( error ) {
      console.error(error);
    }
    
    // set user
    if(userSession.session) {
      supaContext.user = userSession.session.user;
    } else {
      // if no user, but session data in local store
      if(localStoreKey) {
        const localStoreSession = JSON.parse(window.localStorage.getItem(localStoreKey) || '{}');    
        const{ data, error } = await client.auth.setSession({
          access_token: localStoreSession.access_token,
          refresh_token: localStoreSession.refresh_token
        });

        if(error) {
          console.error(error.message);
        }

        if(data.session && data.session.user) {
          supaContext.user = data.session.user;  
        }
        console.log('not logged in');
      } else {
        console.log('not logged in');
      }
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
      <body lang="en" class="pb-20 dark:bg-gray-900">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
