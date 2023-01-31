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
          <button
            onClick$={() => {
              filterState.taskFilter = "all";
            }}
            class={`z-10 bg-gray-900 py-3 px-5 inline-flex items-center text-md font-medium hover:text-sky-700 ${filterState.taskFilter === "completed" ? "text-sky-400" : "text-gray-400"}`}
          >
            All Tasks
          </button>
        </div>
      )}

      <div class={`flex`}>
        {/* TAGS */}
        {toDoState.tags.length > 0 && (
          <div class={`grid grid-cols-4 items-center`}>
            {toDoState.tags.map((tag) => {
              const isActive = filterState.tagFilter && filterState.tagFilter.length > 0 && filterState.tagFilter.some((tg) => tg === tag);
              return (
                <span class={`inline-block text-center py-2 mx-2 rounded-full bg-indigo-100 text-indigo-700 cursor-pointer ${isActive ? `bg-indigo-700 text-indigo-100` : ``}`} onClick$={async () => (filterState.tagFilter = await toggleTag(filterState.tagFilter || [], tag))}>
                  {tag}
                </span>
              )
            })}
          </div>
        )}

        {/* DATE RANGE */}
        {toDoState.tasks.length > 0 && (
          <div class="text-center p-10">
            <em class="text-xs">{filterState.taskFilter === "completed" ? "Complete" : "Started"} Date Range</em>
            <div class="flex flex-col align-center justify-center items-center gap-5">
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
              {(filterState.dateRange.start !== "" || filterState.dateRange.end !== "") && (
                <>
                  <button class="dark:text-gray-400 hover:dark:text-gray-200" onClick$={() => (filterState.dateRange = { start: "", end: "" })}>
                    reset
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default FilterSort;
