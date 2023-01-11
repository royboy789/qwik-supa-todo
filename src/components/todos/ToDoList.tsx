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

type taskFilters = "completed" | "incomplete";

const ToDoList = component$<ToDoListProps>(({ editTask, copyTask, deleteTask, completeTask }) => {
  const converter = new Converter();
  const toDoState = useContext(todoContext);
  const supabase = useContext(supabaseContext);
  const myTasks = useStore({ tasks: toDoState.tasks });
  const filters: { taskFilter: taskFilters } = useStore({
    taskFilter: "incomplete",
  });

  useClientEffect$(({ track }) => {
    track(() => toDoState.tasks);
    myTasks.tasks = toDoState.tasks;
  });

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

  const changePriority = $(async (move: string, task: Task) => {
    const tasksCopy = [...myTasks.tasks];
    const taskIndex = tasksCopy.findIndex((tsk) => tsk.task_id === task.task_id);
    const client = await supabase.client$();

    switch (move) {
      case "down":
        tasksCopy[taskIndex].priority++;
        break;
      case "up":
        tasksCopy[taskIndex].priority -= 1;
        break;
      default:
        return;
    }

    if (supabase.user && client) {
      await editTaskSupa(client, tasksCopy[taskIndex]);
    }
    toDoState.tasks = [...tasksCopy];
  });

  return (
    <div class="tasks">
      {myTasks.tasks.length === 0 && <div class="relative text-center text-3xl mt-10">No Tasks Yet</div>}

      {/* FILTER */}
      {myTasks.tasks.length > 0 && (
        <div class="flex justify-center align-middle items-center my-5 relative space-x-5">
          <span class="hidden sm:block absolute top-1/2 h-1 opacity-70 bg-gray-100 w-full -z-10"></span>
          <button
            onClick$={() => {
              filters.taskFilter = "incomplete";
            }}
            class={`z-10 bg-gray-900 py-3 px-5 inline-flex items-center text-md font-medium  hover:text-sky-700 ${filters.taskFilter === "incomplete" ? "text-sky-400" : "text-gray-400"}`}
          >
            Tasks
          </button>
          <button
            onClick$={() => {
              filters.taskFilter = "completed";
            }}
            class={`z-10 bg-gray-900 py-3 px-5 inline-flex items-center text-md font-medium hover:text-sky-700 ${filters.taskFilter === "completed" ? "text-sky-400" : "text-gray-400"}`}
          >
            Completed Tasks
          </button>
        </div>
      )}

      {/* TASKS */}
      <div>
        {myTasks.tasks.length > 0 &&
          myTasks.tasks
            .filter((task) => {
              switch (filters.taskFilter) {
                case "completed":
                  return task.completed;
                case "incomplete":
                  return !task.completed;
                default:
                  return true;
              }
            })
            .sort((a, b) => {
              switch (filters.taskFilter) {
                case "completed":
                  return (a.completed_on || 0) < (b.completed_on || 0) ? 1 : -1;
                default:
                  return a.priority < b.priority ? -1 : 1;
              }
            })
            .map((task) => {
              return (
                <div class={`relative sm:grid sm:grid-flow-col sm:grid-cols-12 py-5 pr-5 pl-2 hover:bg-gray-100 border-2 border-transparent dark:hover:bg-gray-900`} title={`task priority: ${task.priority}`} data-task={task.task_id}>
                  <div class="flex w-full items-center justify-center sm:justify-start">
                    <button title="make task a higher priority" onClick$={() => changePriority("up", task)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button title="make task a lower priority" onClick$={() => changePriority("down", task)}>
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
                  <div class="col-span-9 px-5 pt-5 sm:pt-0 text-sm flex gap-5 text-center sm:text-left">
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
                  <div class="col-span-2 mt-5 sm:mt-0 w-full text-right ml-2 actions flex flex-row align-center items-center justify-center">
                    <button class="block text-xs py-2 px-2 text-white" onClick$={() => editTask(task)} title="edit task">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 fill-sky-600">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button class="block text-xs py-2 px-2 text-white" onClick$={() => copyTask(task)} title="copy task">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                        />
                      </svg>
                    </button>
                    <button class="block text-xs py-2 px-2 text-white" onClick$={() => deleteTask(task)} title="delete task">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentredColor" class="w-6 h-6 fill-red-500">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
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
