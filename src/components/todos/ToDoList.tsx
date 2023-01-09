import { component$, QRL, $, useContext, useStore, useClientEffect$ } from "@builder.io/qwik";
import { Converter } from "showdown";

import { supabaseContext } from "~/state/supabase";
import { Task, todoContext } from "~/state/todoContext";

import { editTask as editTaskSupa } from "~/utils/supabase";

interface ToDoListProps {
  editTask: QRL<(task: Task) => Promise<Task>>;
  copyTask: QRL<(task: Task) => Promise<Task>>;
  deleteTask: QRL<(task: Task) => Promise<Task>>;
  completeTask: QRL<(task_id: string, checked: boolean) => Promise<Task>>;
}

const ToDoList = component$<ToDoListProps>(({ editTask, copyTask, deleteTask, completeTask }) => {
  const converter = new Converter();
  const toDoState = useContext(todoContext);
  const supabase = useContext(supabaseContext);
  const myTasks = useStore({tasks: toDoState.tasks});

  useClientEffect$(({track}) => {
    track(() => toDoState.tasks);
    myTasks.tasks = toDoState.tasks;
  })

  // date completed formatting
  const dateCompleted = (date: string) => {
    if (!date) {
      return "";
    }
    const completedDate = new Date(Date.parse(date));
    return `${completedDate.getMonth() + 1}/${completedDate.getDate()}/${completedDate.getFullYear()}`;
  };

  // days since created
  const sinceCreated = (date: string) => {
    const startDate = new Date(Date.parse(date));
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const daysAgo = Math.round(diffTime / (1000 * 3600 * 24));
    return daysAgo > 0 ? `${daysAgo} ${daysAgo === 1 ? `day` : `days`} ago` : `Today`;
  };

  const changePriority = $(async(move: string, index: number) => {
    const tasksCopy = [...myTasks.tasks];
    const client = await supabase.client$();
    switch(move) {
      case 'up':
        tasksCopy[index].priority++;
        if(supabase.user && client) {
          await editTaskSupa(client, tasksCopy[index])
        }        
        toDoState.tasks = [...tasksCopy];

      return;
      case 'down':
        tasksCopy[index].priority-=1;
        if(supabase.user && client) {
          await editTaskSupa(client, tasksCopy[index])
        }
        toDoState.tasks = [...tasksCopy];
      return;
      default: 
      return;
    }
  })

  return (
    <div class="tasks">
      {myTasks.tasks.length === 0 && <div class="relative text-center text-3xl mt-10">No Tasks Yet</div>}
      {myTasks.tasks.length > 0 && <h1 class="relative text-center text-5xl my-10">Your Tasks</h1>}
      <div>
        {myTasks.tasks.length > 0 &&
          myTasks.tasks
            .sort((a, b) => (a.priority < b.priority ? -1 : 1))
            .map((task, i) => {
              return (
                <div 
                  class={`relative grid sm:grid-cols-12 py-5 hover:bg-gray-100 border-2 border-transparent dark:hover:bg-gray-900`} 
                  data-priority={task.priority}
                  data-task={task.task_id}
                >
                  <div class="flex items-center justify-start">
                    <button title="change priority level up 1" onClick$={() => changePriority('up', i)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button title="change priority level down 1" onClick$={() => changePriority('down', i)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <div class="h-full flex items-center justify-center ml-3">
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
                  </div>
                  <div class="col-span-10 px-5 text-sm flex gap-5 cursor-pointer" onClick$={() => completeTask(task.task_id, !task.completed)}>
                    <div class="flex-grow flex justify-center flex-col">
                      {/* Name */}
                      <label for={`task-${task.task_id}`} class={`text-xl font-medium cursor-pointer ${task.priority < 3 ? `text-orange-500 dark:text-orange-500` : `text-gray-700 dark:text-gray-200`}`}>
                        {task.name}
                      </label>

                      {/* Created */}
                      <p class="block text-xs text-gray-500 dark:text-gray-100">
                        <span class="inline-block">
                          Created: {dateCompleted(task.created_on)} {sinceCreated(task.created_on)}
                        </span>
                      </p>

                      {/* Completed */}
                      {task.completed && task.completed_on && (
                        <p class="text-xs text-gray-500 dark:text-gray-100">
                          <em>Completed: {dateCompleted(task.completed_on)}</em>
                        </p>
                      )}

                      {/* Description */}
                      {task.description && <div id="task-description" class="text-gray-500 dark:text-gray-200 sm:block hidden leading-7 mb-2 max-h-48 overflow-auto" dangerouslySetInnerHTML={converter.makeHtml(task.description)}></div>}

                      {/* Links */}
                      <p>
                        {task.link &&
                          task.link.length > 0 &&
                          task.link.map((href) => (
                            <a class="inline-block mr-4 text-sky-600" href={href} target={"_blank"} title={href}>
                              Helpful Link
                            </a>
                          ))}
                      </p>
                    </div>
                  </div>
                  <div class="mt-5 sm:mt-0 w-full text-right ml-2 actions w-lg space-y-0 sm:space-y-1 space-x-5 sm:space-x-0 flex flex-row sm:flex sm:flex-col items-cneter justify-center sm:items-end">
                    <button class="block text-xs py-2 px-4 border-2 border-sky-500 hover:bg-sky-700 hover:text-white" onClick$={() => editTask(task)}>
                      Edit
                    </button>
                    <button class="block text-xs py-2 px-4 border-2 border-sky-500 hover:bg-sky-700 hover:text-white" onClick$={() => copyTask(task)}>
                      Copy
                    </button>
                    <button class="block text-xs py-2 px-4 border-2 border-red-500 hover:bg-red-700 hover:text-white" onClick$={() => deleteTask(task)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
});

export default ToDoList;
