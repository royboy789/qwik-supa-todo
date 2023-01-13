 import { QRL, $ } from "@builder.io/qwik";
 import { Task } from "~/state/todoContext";
 
 // Completed Filter Callback
 export const dateFilter: QRL<(task: Task, dateRange: {start: string, end: string}) => Promise<boolean>> = $(async (task, dateRange) => {
  let returnTask = true;

  // check date range
  const startDate = "" !== dateRange.start ? new Date(Date.parse(dateRange.start)) : false;
  const endDate = "" !== dateRange.end ? new Date(Date.parse(dateRange.end)) : false;
  if (startDate && endDate) {

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
    
  }

  return returnTask;
});