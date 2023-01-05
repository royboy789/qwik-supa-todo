import { component$, useClientEffect$, useContext } from "@builder.io/qwik";
import { supabaseContext } from "~/state/supabase";

export default component$(() => {
  const supabase = useContext(supabaseContext);

  useClientEffect$(async () => {
    const client = await supabase.client$();
    if(!client) {
      return;
    }
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    if(supabase.user) {
        window.location.replace('/');
    }

    if(!params.get("access_token")) {
        console.error('missing access token');
        throw new Error('Please Try Again');
    }


    const tokens = {
      access_token: params.get("access_token") || "",
      expires_in: params.get("expires_in") || "",
      refresh_token: params.get("refresh_token") || "",
    };

    document.cookie = `access_token=${tokens.access_token}; path=/`;
    document.cookie = `refresh_token=${tokens.refresh_token}; path=/`;
    document.cookie = `expires_in=${tokens.expires_in}; path=/`;

    const { error } = await client.auth.setSession(tokens);

    if(error) {
        console.error(error);
        throw error;
    }

    window.location.replace("/");
  });

  return <div>Callback</div>;
});
