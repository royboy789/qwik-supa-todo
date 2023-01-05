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
      toDoState.tasks = [...toDoState.tasks, ...[task]];
      return task;
    }

    const tasksCopy = [...toDoState.tasks];
    tasksCopy[editingIndex] = { ...task };

    toDoState.tasks = [...tasksCopy];
    return task;
  });

  // Complete Task
  const completeTask = $((task_id: string, checked: boolean) => {
    const editingIndex = toDoState.tasks.findIndex(
      (tsk) => tsk.uuid === task_id
    );
    const tasksCopy = [...toDoState.tasks];
    tasksCopy[editingIndex].completed = checked;
    if(checked) {
      tasksCopy[editingIndex].completed_on = new Date().getTime().toString();
    }
    toDoState.tasks = [...tasksCopy];

    return toDoState.tasks[editingIndex];
  });

  // Edit Task
  const initEdit = $((task: Task) => {
    toDoState.editTask = { ...task };
    return task;
  });

  // Copy Task
  const initCopy = $((task: Task) => {
    const editTask: Task = { ...task, uuid: "" };
    toDoState.editTask = { ...editTask };
    return task;
  });

  // Delete Task
  const initDelete = $((task: Task) => {
    if (!task.uuid) {
      return task;
    }
    // filter deleted out
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
        completeTask={completeTask}
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
