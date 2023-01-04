import { component$, useContext, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import { Task, todoContext } from "~/state/todoContext";

// Components
import CreateToDo from "~/components/todos/CreateToDo";
import ToDoList from "~/components/todos/ToDoList";

export default component$(() => {
  const toDoState = useContext(todoContext);

  // Create Task
  const createTask = $((task: Task) => {
    const editingIndex = toDoState.tasks.findIndex(
      (tsk) => tsk.uuid === task.uuid
    );

    if (-1 === editingIndex) {
      console.log(`new task`);
      toDoState.tasks = [...toDoState.tasks, ...[task]];
      return task;
    }

    console.log(`editing task: ${task.name} - ${editingIndex}`);
    const tasksCopy = [...toDoState.tasks];
    tasksCopy[editingIndex] = { ...task };

    toDoState.tasks = [...tasksCopy];
    return task;
  });

  // Edit Task
  const initEdit = $((task: Task) => {
    console.log(`editing: ${task.name}`);
    toDoState.editTask = { ...task };
    return task;
  });

  // Copy Task
  const initCopy = $((task: Task) => {
    console.log(`copying: ${task.name}`);
    const editTask: Task = { ...task, uuid: "" };
    toDoState.editTask = { ...editTask };
    return task;
  });

  // Delete Task
  const initDelete = $((task: Task) => {
    console.log(`deleteing ${task.uuid}`)
    if (!task.uuid) {
      return task;
    }
    const deleteIndex = toDoState.tasks.findIndex(
      (tsk) => tsk.uuid === task.uuid
    );
    console.log(deleteIndex);
    toDoState.tasks = toDoState.tasks.filter((tsk) => tsk.uuid !== task.uuid);
    return task;
  });

  return (
    <div class="container space-y-10">
      <CreateToDo createToDo={createTask} />
      <ToDoList
        tasks={toDoState.tasks}
        editTask={initEdit}
        copyTask={initCopy}
        deleteTask={initDelete}
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
