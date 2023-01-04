import { component$, useStore, QRL, useClientEffect$, useContext } from "@builder.io/qwik";
import { v4 as uuidv4 } from "uuid";

import type { Task } from "~/state/todoContext";
import { todoContext } from "~/state/todoContext";

interface CreateToDoProps {
  createToDo: QRL<(task: Task) => Promise<Task>>;
}

const CreateToDo = component$<CreateToDoProps>(({ createToDo }) => {
    const todoState = useContext(todoContext);
    const taskStore: { task: Task } = useStore({task: {} as Task});

    useClientEffect$(({track}) => {
        track(() => todoState.editTask)
        taskStore.task = {...todoState.editTask};
    })

    const { task } = taskStore;

    return (
      <form preventdefault:submit class="space-y-5 max-w-7xl mx-auto">
        <div class="grid grid-cols-6 gap-5">
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
        <div class="grid grid-cols-6 gap-5">
          <label for="todo_link" class="leading-10 col-span-2">
            Helpful Link:
          </label>
          <input
            class="col-span-4"
            type="text"
            name="todo_link"
            placeholder="Where do I do it? Or more context?"
            value={task.link}
            onChange$={(e) => {
              taskStore.task = {
                ...task,
                link: (e.target as HTMLInputElement).value,
              };
            }}
          />
        </div>
        <div class="text-center">
          <label for="todo_description" class="block leading-10">
            Helpful Description:
          </label>
          <textarea
            name="todo_description"
            class="w-full text-xl h-28 focus:h-[300px] transition-all"
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
          <div>
            <button
              type="submit"
              value="Add"
              class="bg-sky-500 py-3 px-10 rounded-xl text-white"
              onClick$={async () => {
                taskStore.task = {...task, uuid: task.uuid && task.uuid !== "" ? task.uuid : uuidv4()}
                await createToDo(taskStore.task);
                taskStore.task = {} as Task;
                todoState.editTask = {} as Task;
              }}
            >
              {!todoState.editTask.name || todoState.editTask.name === '' ? `Add` : `Save`}
            </button>
          </div>
        )}
      </form>
    );
  }
);

export default CreateToDo;
