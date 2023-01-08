import { component$, useStore, $, useSignal } from "@builder.io/qwik";

const SignIn = component$(() => {
  const user = useStore({ email: "" });
  const sent = useSignal(false);
  const initSignIn = $(async () => {
    sent.value = true;
    // send magiclink
    await fetch(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ user: { ...user } }),
    });
  });

  return (
    <div>
      {sent.value ? (
        <div>Sending a magic link to your email, use it.</div>
      ) : (
        <form
          preventdefault:submit
          class="mt-5 mx-auto max-w-full sm:max-w-5xl"
          onSubmit$={initSignIn}
        >
          <div class="grid sm:grid-cols-3 gap-5 xs:grid-cols-1">
            <label class="leading-10" for="user_email">
              Sign In or Sign Up with your email:
            </label>
            <input
              type="email"
              id="user_email"
              name="user_email"
              placeholder="Sign Up / Sign In with email"
              value=""
              class="dark:text-black"
              onChange$={(e) =>
                (user.email = (e.target as HTMLInputElement).value)
              }
            />
            <butotn
              type="submit"
              onClick$={initSignIn}
              class={`block py-2 px-4 border-2 border-sky-500 hover:bg-sky-700 hover:text-white cursor-pointer`}
            >
              Sign In
            </butotn>
          </div>
        </form>
      )}
    </div>
  );
});

export default SignIn;
