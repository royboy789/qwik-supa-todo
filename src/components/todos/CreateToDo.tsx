import {
  component$,
  useStore,
  QRL,
  useClientEffect$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { v4 as uuidv4 } from "uuid";

import type { Task } from "~/state/todoContext";
import { todoContext } from "~/state/todoContext";

interface CreateToDoProps {
  createToDo: QRL<(task: Task) => Promise<Task>>;
}

const CreateToDo = component$<CreateToDoProps>(({ createToDo }) => {
  const todoState = useContext(todoContext);
  const active = useSignal(false);
  const taskStore: { task: Task } = useStore({ task: {} as Task });

  useClientEffect$(({ track }) => {
    track(() => todoState.editTask);
    taskStore.task = { ...todoState.editTask };

    if (todoState.editTask.name || todoState.editTask.name !== "") {
      active.value = true;
    }
  });

  const { task } = taskStore;
  return (
    <div
      class={`relative transition-all duration-500 border-b-2 border-gray-200 ${
        !active.value ? `h-14 overflow-hidden` : `sm:h-[650px] pb-20 overflow-auto`
      }`}
    >
      <form
        id="task-form"
        preventdefault:submit
        class={`relative space-y-5 max-w-7xl mx-auto focus:h-auto`}
      >
        <div class="pb-5 space-x-2">
          <button
            class="border-2 border-sky-200 hover:border-sky-400 py-2 px-4"
            onClick$={() => {
              active.value = true;
            }}
          >
            {!todoState.editTask.name || todoState.editTask.name === ""
              ? `Create`
              : `Edit`}{" "}
            Task
          </button>
          {active.value && (
            <button
              onClick$={() => {
                active.value = false;
              }}
            >
              close
            </button>
          )}
        </div>
        <div class="grid sm:grid-cols-6 gap-5">
          <label for="todo_title" class="leading-10 col-span-2">
            What To Do?
          </label>
          <input
            class="col-span-4"
            type="text"
            name="todo_title"
            placeholder="What do I need to do?"
            value={task.name}
            onChange$={(e) => {
              taskStore.task = {
                ...task,
                name: (e.target as HTMLInputElement).value,
              };
            }}
          />
        </div>
        <div class="grid sm:grid-cols-6 gap-5">
          <div class="col-span-2">
            <label for="todo_link" class="leading-10">
              Helpful Links
            </label>
            <button
              type="button"
              class="inline-block ml-2 border-2 border-sky-200 hover:border-sky-400 text-xs py-1 px-3"
              onClick$={() => {
                taskStore.task = {
                  ...task,
                  link: task.link ? [...task.link, ...[""]] : [""],
                };
              }}
            >
              + link
            </button>
          </div>
          <divm class="col-span-4">
            {task.link && task.link.map((link, i) => {
              return (
                <input
                  class="w-full mb-2"
                  type="text"
                  name="todo_link"
                  placeholder="Where do I do it? Or more context?"
                  value={link}
                  onChange$={(e) => {
                    const linkCopy = task.link || [];
                    linkCopy[i] = (e.target as HTMLInputElement).value;
                    taskStore.task = {
                      ...task,
                      link: [...linkCopy]
                    };
                  }}
                />
              );
            })}
          </divm>
        </div>
        <div class="text-center">
          <label for="todo_description" class="block leading-10">
            Helpful Description:
          </label>
          <textarea
            name="todo_description"
            class="w-full text-xl h-[300px] transition-all"
            placeholder="Context & Notes"
            value={task.description}
            onChange$={(e) => {
              taskStore.task = {
                ...task,
                description: (e.target as HTMLTextAreaElement).value,
              };
            }}
          ></textarea>
        </div>
        {taskStore.task.name && (
          <div class="space-x-5">
            <button
              type="submit"
              value="Add"
              class="bg-sky-500 py-3 px-10 rounded-xl text-white"
              onClick$={async () => {
                taskStore.task = {
                  ...task,
                  link: task.link?.filter((href) => href !== ''),
                  task_id:
                    task.task_id && task.task_id !== ""
                      ? task.task_id
                      : uuidv4(),
                };
                await createToDo(taskStore.task);
                active.value = false;
                taskStore.task = {} as Task;
                todoState.editTask = {} as Task;
              }}
            >
              {!todoState.editTask.name || todoState.editTask.name === ""
                ? `Add`
                : `Save`}
            </button>
            <button
              type="submit"
              value="Add"
              class="bg-red-500 py-3 px-10 rounded-xl text-white"
              onClick$={async () => {
                todoState.editTask = {} as Task;
              }}
            >
              Clear
            </button>
          </div>
        )}
      </form>
    </div>
  );
});

export default CreateToDo;
