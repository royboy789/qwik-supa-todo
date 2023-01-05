import { component$, QRL } from "@builder.io/qwik";

import { Task } from "~/state/todoContext";

interface ToDoListProps {
  tasks: Task[];
  editTask: QRL<(task: Task) => Promise<Task>>;
  copyTask: QRL<(task: Task) => Promise<Task>>;
  deleteTask: QRL<(task: Task) => Promise<Task>>;
  completeTask: QRL<(task_id: string, checked: boolean) => Promise<Task>>;
}

const ToDoList = component$<ToDoListProps>(({ tasks, editTask, copyTask, deleteTask, completeTask }) => {

  const dateCompleted = (date: string) => {
    const completedDate = new Date();
    completedDate.setTime(parseInt(date));

    return `${completedDate.getMonth()+1}/${completedDate.getDate()}/${completedDate.getFullYear()}`;
  }
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
            <div class="col-span-4 px-5 text-sm flex gap-5 cursor-pointer" onClick$={() => completeTask(task.uuid, !task.completed)}>
              <div class="items-centet h-full flex items-center justify-center">
                <input
                  id={`task-${task.uuid}`}
                  aria-describedby="comments-description"
                  name={`task-${task.uuid}`}
                  type="checkbox"
                  class="h-8 w-8 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  checked={task.completed || false}
                  onChange$={(e) => {
                    completeTask(task.uuid, (e.target as HTMLInputElement).checked);
                  }}
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
                {task.completed && (
                  <p class="text-gray-500 mt-5">
                    <em>Completed: {dateCompleted(task.completed_on)}</em>
                  </p>
                )}
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