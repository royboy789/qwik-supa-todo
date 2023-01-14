import { component$, useContext, useClientEffect$ } from "@builder.io/qwik";

// import { Task } from "~/state/todoContext";

import { todoContext } from "~/state/todoContext";
import { filterContext } from "~/state/filters";

import { setDateRange, filterSortTasks, toggleTag } from "~/utils/filters";

const FilterSort = component$(() => {
  const toDoState = useContext(todoContext);
  const filterState = useContext(filterContext);

  useClientEffect$(async ({ track }) => {
    track(() => toDoState.tasks);
    track(() => filterState.taskFilter);
    track(() => filterState.dateRange);
    track(() => filterState.tagFilter);

    toDoState.filteredTasks = [];
    toDoState.filteredTasks = await filterSortTasks(toDoState.tasks, filterState);
  });

  return (
    <>
      {!toDoState.tasks.length && <div>filters loading...</div>}
      {/* FILTER */}
      {toDoState.tasks.length > 0 && (
        <div class="flex justify-center align-middle items-center my-5 relative space-x-5">
          <span class="hidden sm:block absolute top-1/2 h-1 opacity-70 bg-gray-100 w-full -z-10"></span>
          <button
            onClick$={() => {
              filterState.taskFilter = "incomplete";
            }}
            class={`z-10 bg-gray-900 py-3 px-5 inline-flex items-center text-md font-medium  hover:text-sky-700 ${filterState.taskFilter === "incomplete" ? "text-sky-400" : "text-gray-400"}`}
          >
            Tasks
          </button>
          <button
            onClick$={() => {
              filterState.taskFilter = "completed";
            }}
            class={`z-10 bg-gray-900 py-3 px-5 inline-flex items-center text-md font-medium hover:text-sky-700 ${filterState.taskFilter === "completed" ? "text-sky-400" : "text-gray-400"}`}
          >
            Completed Tasks
          </button>
        </div>
      )}

      {/* TAGS */}
      {filterState.tagFilter && filterState.tagFilter.length > 0 && (
        <div class={`flex items-center justify-center gap-x-3`}>
          <span>Filtered By: </span>
          {filterState.tagFilter.map((tag) => (
            <span class={`inline-flex items-center rounded-full bg-indigo-100 py-0.5 pl-2.5 pr-1 text-sm font-medium text-indigo-700`}>
              {tag}
              <button onClick$={async() => filterState.tagFilter = await toggleTag(filterState.tagFilter || [], tag)} type="button" class="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none">
                <span class="sr-only">Remove {tag}</span>
                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* DATE RANGE */}
      {toDoState.tasks.length > 0 && filterState.taskFilter === "completed" && (
        <div class="text-center pt-5">
          <em>Completed Date Range</em>
          <div class="flex flex-row align-center justify-center items-center gap-5 py-2">
            <input
              type="date"
              class={`dark:text-gray-400`}
              onChange$={async (e) => {
                filterState.dateRange = await setDateRange((e.target as HTMLInputElement).value, true, filterState.dateRange);
              }}
              value={filterState.dateRange.start}
            />
            <input
              type="date"
              class={`dark:text-gray-400`}
              onChange$={async (e) => {
                filterState.dateRange = await setDateRange((e.target as HTMLInputElement).value, false, filterState.dateRange);
              }}
              value={filterState.dateRange.end}
            />
          </div>
          <div class="text-center pb-5">
            {(filterState.dateRange.start !== "" || filterState.dateRange.start !== "") && (
              <>
                <button class="dark:text-gray-400 hover:dark:text-gray-200" onClick$={() => (filterState.dateRange = { start: "", end: "" })}>
                  reset
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default FilterSort;
