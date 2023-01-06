import { component$ } from "@builder.io/qwik";

export default component$(() => {

  return (
    <header>
      <div class="mx-auto max-w-full sm:max-w-[60vw] py-10 px-4 sm:px-6 lg:px-8 dark:text-white">
        <div class="text-center">
          <h2 class="text-lg font-semibold text-indigo-600 dark:text-indigo-100"><a href="/">Work</a></h2>
          <p class="mt-1 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
            It needs to get done.
          </p>
          <p class="mx-auto mt-5 max-w-xl text-xl text-gray-500 dark:text-gray-200">
            What are you going to check off today?
          </p>
        </div>
      </div>
    </header>
  );
});
