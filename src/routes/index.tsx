import { component$, useContext, $, useTask$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import { Task, todoContext } from "~/state/todoContext";

import { supabaseContext } from "~/state/supabase";

import { insertTask, editTask, deleteTask, completeTask } from "~/utils/supabase";

// Components
import SignIn from "~/components/auth/SignIn";
import CreateToDo from "~/components/todos/CreateToDo";
import ToDoList from "~/components/todos/ToDoList";
import { User } from "@supabase/supabase-js";

export default component$(() => {
  const toDoState = useContext(todoContext);
  const supabase = useContext(supabaseContext);
  const auth: { user: User | false } = useStore({user: supabase.user});

  useTask$(({track}) => {
    const user = track(() => supabase.user);
    if(user) {
      auth.user = {...user};
    }
  })

  // Create Task
  const createTask = $(async(task: Task) => {
    const client = await supabase.client$();
    const editingIndex = toDoState.tasks.findIndex(
      (tsk) => tsk.task_id === task.task_id
    );

    // new task
    if (-1 === editingIndex) {
      if(!auth.user || !client) {
        toDoState.tasks = [...toDoState.tasks, ...[task]];
        return task;
      }

      // new task - supa
      const newTask = await insertTask(client, task, auth.user.id);
      toDoState.tasks = [...toDoState.tasks, ...[newTask]];
      return task;
    }

    //editing task
    const tasksCopy = [...toDoState.tasks];
    tasksCopy[editingIndex] = { ...task };

    toDoState.tasks = [...tasksCopy];
    if(!auth.user || !client) {
      return task;
    }

    await editTask(client, task);
    return task;
  });

  // Complete Task
  const completeTaskInit = $(async(task_id: string, checked: boolean) => {
    const client = await supabase.client$();

    const editingIndex = toDoState.tasks.findIndex(
      (tsk) => tsk.task_id === task_id
    );
    const tasksCopy = [...toDoState.tasks];
    tasksCopy[editingIndex].completed = checked;
    if(checked) {
      tasksCopy[editingIndex].completed_on = new Date().toISOString();
    }
    toDoState.tasks = [...tasksCopy];

    if(client && auth.user) {
      const completed = await completeTask(client, task_id, checked);
      if(completed) {
        const tasksCopy = [...toDoState.tasks];
        tasksCopy[editingIndex] = completed;
        toDoState.tasks = [...tasksCopy]
      }
    }

    return toDoState.tasks[editingIndex];
  });

  // Edit Task
  const initEdit = $((task: Task) => {
    toDoState.editTask = { ...task };
    window.scrollTo(0,0);
    return task;
  });

  // Copy Task
  const initCopy = $((task: Task) => {
    const editTask: Task = { ...task, task_id: "" };
    toDoState.editTask = { ...editTask };
    return task;
  });

  // Delete Task
  const initDelete = $(async (task: Task) => {
    const client = await supabase.client$();
    if (!task.task_id || !client) {
      return task;
    }
    // filter deleted out
    toDoState.tasks = toDoState.tasks.filter((tsk) => tsk.task_id !== task.task_id);
    await deleteTask(client, task);
    return task;
  });

  // signOut
  const initSignOut = $(async() => {
    const client = await supabase.client$();
    if (!client) {
      return;
    }

    await client.auth.signOut();

    document.cookie = `access_token=; path=/`;
    document.cookie = `refresh_token=; path=/`;
    document.cookie = `expires_in=; path=/`;

    window.location.replace('/');
  })

  return (
    <div class="container space-y-10 max-w-full sm:max-w-[60vw] dark:text-white">
      <div class="auth text-center">
        {!auth.user && (
          <div>
            <p>
              Not currently logged in, using local store
            </p>
            <SignIn />
          </div>
        )}
        {auth.user && (
          <div>
            <p>
              You are signed in as {auth.user.email}
            </p>
            <button onClick$={initSignOut} class="inline-block mt-2 border-2 border-red-500 p-2 text-xs cursor-pointer">sign out</button>
          </div>
        )}
      </div>
      <CreateToDo createToDo={createTask} />
      <ToDoList
        tasks={toDoState.tasks}
        editTask={initEdit}
        copyTask={initCopy}
        deleteTask={initDelete}
        completeTask={completeTaskInit}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "My To Dos",
  meta: [
    {
      name: "description",
      content: "To Do Site",
    },
  ],
};
