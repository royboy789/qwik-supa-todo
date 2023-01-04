import {
  component$,
  Slot,
  useClientEffect$,
  useStore,
  useContextProvider,
  useSignal,
} from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";
import Header from "../components/header/header";

import type { Task, ToDoContext } from "~/state/todoContext";
import { todoContext } from "~/state/todoContext";

export default component$(() => {
  const loaded = useSignal(false);
  const taskStore: ToDoContext = useStore({
    tasks: [],
    editTask: {
      name: "",
      description: "",
      completed: false,
      created: new Date().getTime().toString(),
      uuid: '',
    } as Task,
  });

  useClientEffect$(({ track }) => {
    if (isServer) {
      return;
    }
    const tasks = track(() => taskStore.tasks);
    if (!loaded.value) {
      console.log("loading tasks");
      taskStore.tasks = JSON.parse(
        window.localStorage.getItem("myTasks") || "[]"
      );
      loaded.value = true;
      return;
    }
    console.log("task change");
    console.log(taskStore.tasks);
    if (tasks.length > 0) {
      window.localStorage.setItem("myTasks", JSON.stringify(tasks));
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
          Made with ♡ because I couldn't find a better solution that worked for
          me
        </span>
      </footer>
    </>
  );
});
