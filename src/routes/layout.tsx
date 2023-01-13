import { component$, Slot, useClientEffect$, useStore, useContextProvider, useContext, useSignal, Resource, QRL, $ } from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";
import { RequestHandler, useEndpoint } from "@builder.io/qwik-city";
import { createClient, AuthResponse } from "@supabase/supabase-js";

import type { Task, ToDoContext } from "~/state/todoContext";
import { todoContext } from "~/state/todoContext";
import { supabaseContext } from "~/state/supabase";

import { getTasks } from "~/utils/supabase";

// Components
import Header from "../components/header/header";

/**
 * On Get - Set Session if cookies
 * @param param0
 * @returns
 */
export const onGet: RequestHandler<AuthResponse["data"] | void> = async ({ request }) => {
  // supabase client
  const client = import.meta.env.VITE_SUPABASE_URL ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY) : false;
  if (!client) {
    return;
  }

  const cookies = request.headers.get("cookie");
  const params = new URLSearchParams(cookies?.replace(/; /g, "&"));
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (!access_token || !refresh_token) {
    return;
  }

  const { data: currentSess } = await client.auth.getSession();

  if (currentSess.session) {
    return;
  }

  const { data: newSess } = await client.auth.setSession({ access_token, refresh_token });

  return newSess;
};

export default component$(() => {
  const session = useEndpoint<AuthResponse["data"]>();
  const loaded = useSignal(false);
  const supabase = useContext(supabaseContext);
  const taskStore: ToDoContext = useStore({
    tasks: [],
    tags: [''],
    editTask: {
      name: "",
      description: "",
      completed: false,
      created_on: new Date().toISOString(),
      task_id: "",
      user_id: "",
      link: [""],
      tags: [""],
    } as Task,
  });

  // Get All Tags
  const getTags: QRL<(tasks: Task[]) => string[]> = $((tasks) => {
    const returnTags: { tags: string[] } = { tags: [] };
    tasks.forEach((task) => {
      if(!task.tags) {
        return;
      }
      returnTags.tags = [...returnTags.tags, ...task.tags];
    })
    returnTags.tags = returnTags.tags.filter((tag, i, tags) => tags.indexOf(tag) === i)
    return returnTags.tags;
  })

  useClientEffect$(async ({ track }) => {
    if (isServer) {
      return;
    }
    const tasks = track(() => taskStore.tasks);
    const client = await supabase.client$();

    const { user } = supabase;

    // edit task user
    if ("" === taskStore.editTask.user_id && user) {
      taskStore.editTask = { ...taskStore.editTask, user_id: user.id };
    }

    if (!loaded.value && tasks.length === 0) {
      if (!user || !client) {
        const localTasks = JSON.parse(window.localStorage.getItem("myTasks") || "[]");
        taskStore.tasks = [...localTasks] || [];
        taskStore.tags = await getTags([...taskStore.tasks]);
        loaded.value = true;
        return;
      }
      const cloudTasks = await getTasks(client);
      taskStore.tasks = [...cloudTasks];
      taskStore.tags = await getTags([...taskStore.tasks]);
      loaded.value = true;
      return;
    }

    if (tasks.length > 0 && !user) {
      window.localStorage.setItem("myTasks", JSON.stringify(tasks));
      loaded.value = true;
      return;
    }
  });

  useContextProvider(todoContext, taskStore);

  return (
    <>
      <main>
        <Header />
        <section>
          <Resource
            value={session}
            onResolved={(sess) => {
              if(sess && sess.session) {
                supabase.user = sess.session?.user || false;
              }
              return <Slot />;
            }}
          />
        </section>
      </main>
      <footer class="text-center">
        <span class="text-gray-400 italic">
          Made with <span class="text-red-500">♡</span> because I couldn't find a better solution that worked for me
        </span>
        <a class="block text-sky-500 hover:underline mt-2d" target="_blank" href="https://github.com/royboy789/qwik-supa-todo">
          GitHub Repo
        </a>
      </footer>
    </>
  );
});
