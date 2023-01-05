import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./header.css?inline";

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <header>
      <div class="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-lg font-semibold text-indigo-600"><a href="/">Work</a></h2>
          <p class="mt-1 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            It needs to get done.
          </p>
          <p class="mx-auto mt-5 max-w-xl text-xl text-gray-500">
            What are you going to check off today?
          </p>
        </div>
      </div>
    </header>
  );
});
