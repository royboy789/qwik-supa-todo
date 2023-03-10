import { createContext } from "@builder.io/qwik";

export type Task = {
    name: string
    description?: string
    link?: string[]
    completed: boolean
    completed_on?: string
    created_on: string
    task_id: string
    user_id: string
    priority: number
    tags: string[]
}

export interface ToDoContext {
    tasks: Task[]
    filteredTasks: Task[]
    editTask: Task
    tags: string[]
}


export const contextName = 'todoContext';
export const todoContext = createContext<ToDoContext>(contextName);