import { component$, QRL } from "@builder.io/qwik";

import { Task } from "~/state/todoContext";

interface ToDoListProps {
  tasks: Task[];
  editTask: QRL<(task: Task) => Promise<Task>>;
  copyTask: QRL<(task: Task) => Promise<Task>>;
  deleteTask: QRL<(task: Task) => Promise<Task>>;
}

const ToDoList = component$<ToDoListProps>(({ tasks, editTask, copyTask, deleteTask }) => {
  return (
    <div class="tasks">
      {tasks.length === 0 && (
        <div class="relative text-center text-3xl mt-10">No Tasks Yet</div>
      )}
      {tasks.length > 0 && (
        <h1 class="relative text-center text-5xl my-10">Your Tasks</h1>
      )}
      {tasks.map((task) => {
        return (
          <div class="relative grid grid-cols-6 p-5 hover:bg-gray-100">
            <div class="col-span-4 px-5 text-sm flex gap-5">
              <div class="items-centet h-full flex items-center justify-center">
                <input
                  id={`task-${task.uuid}`}
                  aria-describedby="comments-description"
                  name={`task-${task.uuid}`}
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  checked={task.completed || false}
                />
              </div>
              <div>
                <label
                  for={`task-${task.uuid}`}
                  class="text-xl font-medium text-gray-700 cursor-pointer"
                >
                  {task.name}
                </label>
                <p id="comments-description" class="text-gray-500">
                  {task.description}
                  {task.link && (
                    <a
                      class="block text-sky-600"
                      href={task.link}
                      target={"_blank"}
                    >
                      Helpful Link
                    </a>
                  )}
                </p>
              </div>
            </div>
            <div class="col-span-2 text-right ml-2 actions w-lg space-y-1 flex flex-col items-end">
              <button class="block text-xs py-2 px-4 border-2 border-sky-500 hover:bg-sky-700 hover:text-white" onClick$={() => editTask(task)}>Edit</button>
              <button class="block text-xs py-2 px-4 border-2 border-sky-500 hover:bg-sky-700 hover:text-white" onClick$={() => copyTask(task)}>Copy</button>
              <button class="block text-xs py-2 px-4 border-2 border-red-500 hover:bg-red-700 hover:text-white" onClick$={() => deleteTask(task)}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ToDoList;