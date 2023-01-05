import {
  component$,
  Slot,
  useClientEffect$,
  useStore,
  useContextProvider,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";
import Header from "../components/header/header";

import type { Task, ToDoContext } from "~/state/todoContext";
import { todoContext } from "~/state/todoContext";
import { supabaseContext } from "~/state/supabase";

import { getTasks } from "~/utils/supabase";

export default component$(() => {
  const loaded = useSignal(false);
  const supabase = useContext(supabaseContext);
  const taskStore: ToDoContext = useStore({
    tasks: [],
    editTask: {
      name: "",
      description: "",
      completed: false,
      created_on: new Date().toISOString(),
      task_id: "",
      user_id: "",
    } as Task,
  });

  useClientEffect$(async ({ track }) => {
    if (isServer) {
      return;
    }
    const tasks = track(() => taskStore.tasks);
    const client = await supabase.client$();

    const { user } = supabase;

    // edit task user
    if("" === taskStore.editTask.user_id && user) {
      taskStore.editTask = {...taskStore.editTask, user_id: user.id}
    }

    if (!loaded.value && tasks.length === 0) {
      if (!user || !client) {
        const localTasks = JSON.parse(
          window.localStorage.getItem("myTasks") || "[]"
        );
        taskStore.tasks = [...localTasks] || [];
        loaded.value = true;
        return;
      }
      const cloudTasks = await getTasks( client );
      taskStore.tasks = [...cloudTasks];
      return;
    }

    if (tasks.length > 0 && !user) {
      window.localStorage.setItem("myTasks", JSON.stringify(tasks));
      return;
    }
  });

  useContextProvider(todoContext, taskStore);

  return (
    <>
      <main>
        <Header />
        <section>
          <Slot />
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
