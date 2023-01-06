import { component$, QRL } from "@builder.io/qwik";
import { Converter } from 'showdown';
import { Task } from "~/state/todoContext";

interface ToDoListProps {
  tasks: Task[];
  editTask: QRL<(task: Task) => Promise<Task>>;
  copyTask: QRL<(task: Task) => Promise<Task>>;
  deleteTask: QRL<(task: Task) => Promise<Task>>;
  completeTask: QRL<(task_id: string, checked: boolean) => Promise<Task>>;
}

const ToDoList = component$<ToDoListProps>(({ tasks, editTask, copyTask, deleteTask, completeTask }) => {
  const converter = new Converter();
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
      {tasks.length > 0 && tasks.map((task) => {
        return (
          <div class="relative grid sm:grid-cols-6 p-5 hover:bg-gray-100">
            <div class="col-span-5 px-5 text-sm flex gap-5 cursor-pointer" onClick$={() => completeTask(task.task_id, !task.completed)}>
              <div class="items-centet h-full flex items-center justify-center">
                <input
                  id={`task-${task.task_id}`}
                  aria-describedby="comments-description"
                  name={`task-${task.task_id}`}
                  type="checkbox"
                  class="h-8 w-8 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  checked={task.completed || false}
                  onChange$={(e) => {
                    completeTask(task.task_id, (e.target as HTMLInputElement).checked);
                  }}
                />
              </div>
              <div class="flex-grow">
                {/* Name */}
                <label
                  for={`task-${task.task_id}`}
                  class="text-xl font-medium text-gray-700 cursor-pointer"
                >
                  {task.name}
                </label>
                
                {/* Created */}
                <p class="block text-xs text-gray-500">
                  Created: {dateCompleted(task.created_on)}
                </p>
                
                {/* Completed */}
                {task.completed && task.completed_on && (
                  <p class="text-xs text-gray-500">
                    <em>Completed: {dateCompleted(task.completed_on)}</em>
                  </p>
                )}

                {/* Description */}
                {task.description && (
                  <div id="task-description" class="text-gray-500 sm:block hidden leading-7 mb-2 max-h-48 overflow-auto" dangerouslySetInnerHTML={converter.makeHtml(task.description)}></div>
                )}
                
                {/* Links */}
                <p>
                  {task.link && task.link.length > 0 && task.link.map((href) => (
                    <a
                      class="inline-block mr-4 text-sky-600"
                      href={href}
                      target={"_blank"}
                      title={href}
                    >
                      Helpful Link
                    </a>
                  ))}
                </p>
              </div>
            </div>
            <div class="mt-5 sm:mt-0 w-full text-right ml-2 actions w-lg space-y-0 sm:space-y-1 space-x-5 sm:space-x-0 flex flex-row sm:flex sm:flex-col items-cneter justify-center sm:items-end">
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