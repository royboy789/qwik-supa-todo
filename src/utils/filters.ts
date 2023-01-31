import { QRL, $ } from "@builder.io/qwik";
import { Task } from "~/state/todoContext";

import { FilterContextProps } from "~/state/filters";

// Completed Filter Callback
export const isWithinDateRange: QRL<(task: Task, dateRange: { start: string; end: string }, mode: "STARTED" | "COMPLETED") => Promise<boolean>> = $(async (task, dateRange, mode) => {
  let returnTask = true;

  // check date range
  const startDate = "" !== dateRange.start ? new Date(Date.parse(dateRange.start)) : false;
  const endDate = "" !== dateRange.end ? new Date(Date.parse(dateRange.end)) : false;
  if (startDate || endDate) {
    console.log('here');
    switch (mode) {
      case "COMPLETED":
        // completed tasks
        const completedDate = task.completed_on ? new Date(Date.parse(task.completed_on)) : false;
        if (completedDate) {
          // start only
          if (startDate && !endDate && completedDate.getTime() < startDate.getTime()) {
            returnTask = false;
          }

          // end only
          if (!startDate && endDate && completedDate.getTime() < endDate.getTime()) {
            returnTask = false;
          }

          // start and end
          if (startDate && endDate && (completedDate.getTime() < startDate.getTime() || completedDate.getTime() > endDate.getTime())) {
            returnTask = false;
          }
        }
        break;
      case "STARTED":
        // completed tasks
        const startedDate = task.created_on ? new Date(Date.parse(task.created_on)) : false;
        if (startedDate) {
          console.log(startedDate, startedDate);
          // start only
          if (startDate && !endDate && startedDate.getTime() < startDate.getTime()) {
            returnTask = false;
          }

          // end only
          if (!startDate && endDate && startedDate.getTime() > endDate.getTime()) {
            returnTask = false;
          }

          // start and end
          if (startDate && endDate && (startedDate.getTime() < startDate.getTime() || startedDate.getTime() > endDate.getTime())) {
            returnTask = false;
          }
        }
        break;
    }
  }

  return returnTask;
});

// Has Task Tag
export const hasTaskTag: QRL<(task: Task, tags: string[]) => boolean> = $((task, tags) => {
  if (!tags || !tags.length) {
    return true;
  }

  if (!task.tags || !task.tags.length) {
    return false;
  }

  return tags.every((tg) => task.tags && -1 !== task.tags.indexOf(tg));
});

// Filter and Sort
export const filterSortTasks: QRL<(tasks: Task[], filterState: FilterContextProps) => Promise<Task[]>> = $(async (tasks, filterState) => {
  const newTasks: { tasks: Task[] } = { tasks: [] as Task[] };

  // complete / incomplete
  for (let i = 0; i < tasks.length; i++) {
    switch (filterState.taskFilter) {
      case "completed":
        const completed = tasks[i].completed && (await isWithinDateRange(tasks[i], filterState.dateRange, "COMPLETED")) && (await hasTaskTag(tasks[i], filterState.tagFilter || []));
        if (completed) {
          newTasks.tasks = [...newTasks.tasks, tasks[i]];
        }
        break;
      case "incomplete":
        if (!tasks[i].completed && (await hasTaskTag(tasks[i], filterState.tagFilter || [])) && (await isWithinDateRange(tasks[i], filterState.dateRange, "STARTED"))) {
          newTasks.tasks = [...newTasks.tasks, tasks[i]];
        }
        break;
      case "all":
        const completedAll = (await hasTaskTag(tasks[i], filterState.tagFilter || [])) && (await isWithinDateRange(tasks[i], filterState.dateRange, "STARTED"));
        if (completedAll) {
          newTasks.tasks = [...newTasks.tasks, tasks[i]];
        }
        break;
    }
  }

  newTasks.tasks.sort((a, b) => {
    switch (filterState.taskFilter) {
      case "completed":
        return (a.completed_on || 0) < (b.completed_on || 0) ? 1 : -1;
      default:
        return a.priority < b.priority ? -1 : 1;
    }
  });

  return newTasks.tasks;
});

// set date range
export const setDateRange: QRL<(date: string, isStart: boolean, currentDateRange: FilterContextProps["dateRange"]) => FilterContextProps["dateRange"]> = $((date, isStart, currentDateRange) => {
  // set start date
  if (isStart) {
    return {
      ...currentDateRange,
      start: date,
    };
  }

  // set end date
  return {
    ...currentDateRange,
    end: date,
  };
});

// toggle tag
export const toggleTag: QRL<(currentTags: string[], tag: string) => string[]> = $((currentTags, tag) => {
  if (-1 !== currentTags.indexOf(tag)) {
    return currentTags.filter((tg) => tg !== tag);
  }
  return [...currentTags, tag];
});
