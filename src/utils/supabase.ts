import { $, QRL } from "@builder.io/qwik";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Task } from "~/state/todoContext";

/**
 * Get Tasks
 */
export const getTasks: QRL<(client: SupabaseClient) => Promise<Task[]>> = $(
  async (client) => {
    const { data: cloudTasks } = await client.from("tasks").select("*");
    return cloudTasks ? cloudTasks : [];
  }
);

/**
 * Insert Task
 */
export const insertTask: QRL<
  (client: SupabaseClient, task: Task, user_id: string) => Promise<Task>
> = $(async (client, task, user_id) => {
  const { data, error } = await client
    .from("tasks")
    .insert({
      link: task.link,
      description: task.description,
      name: task.name,
      user_id: user_id,
    })
    .select("*");
  if (error) {
    console.error(error.message);
    return task;
  }

  return data ? data[0] : task;
});

/**
 * Edit Task
 */
export const editTask: QRL<
  (client: SupabaseClient, task: Task) => Promise<Task>
> = $(async (client, task) => {
  const { data, error } = await client
    .from("tasks")
    .update({
      link: task.link,
      description: task.description,
      name: task.name,
    })
    .eq("task_id", task.task_id)
    .select("*");
  if (error) {
    console.error(error.message);
    return task;
  }

  return data ? data[0] : task;
});

/**
 * Edit Task
 */
export const deleteTask: QRL<
  (client: SupabaseClient, task: Task) => Promise<void>
> = $(async (client, task) => {
  const { error } = await client
    .from("tasks")
    .delete()
    .eq("task_id", task.task_id);
  if (error) {
    console.error(error.message);
    return;
  }
  return;
});

/**
 * Complete Task
 */
export const completeTask: QRL<
  (
    client: SupabaseClient,
    task_id: string,
    isComplete: boolean
  ) => Promise<Task|void>
> = $(async (client, task_id, isComplete) => {
  const { data: completedTask, error } = await client
    .from("tasks")
    .update({
      completed: isComplete,
      completed_on: isComplete ? new Date().toISOString() : null,
    } as Task)
    .eq("task_id", task_id)
    .select("*");

  if (error) {
    console.error(error.message);
    return;
  }

  return completedTask ? completedTask[0] : null;
});
