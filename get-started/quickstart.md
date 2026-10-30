# Quickstart: your first project

In this quickstart you create a Codenotch project, run it on your machine, write a process
and call it from your app. It takes about ten minutes, and you finish with a page that greets
you by name.

## Before you begin

- [Install the tools](install.md): the `cn` command and the local runtime, with your
  developer license installed.

## Step 1: Create a project

```bash
cn project new -t default -p hello
cd hello
```

`-t default` starts from the empty project template, and `-p hello` creates it in a new
folder named `hello`. The folder must not exist yet, or be empty. The CLI writes six files and
installs the project's npm packages:

```text
✓ 6 file(s) written from the 'default' template

Installing dependencies...
✓ Dependencies installed

Your new Codenotch project is ready at:
/Users/ada/hello
```

The project is named after its folder: its name is `hello`, and its address on the runtime is
`/hello`.

> [!IMPORTANT]
> Name the folder with lowercase letters and digits only, such as `hello` or `expenses`. A
> dash or an underscore gives the project a name and an address that differ, and the apps of
> such a project cannot start processes.

<!-- gap D3: remove the callout once @codenotch/react starts processes under the uri -->

## Step 2: Run it

```bash
cn project start
```

The CLI compiles the project, deploys it to the local runtime and opens it in your browser:

```text
Building project "hello"...
...
✓ Compilation complete
Deploying project "hello" to runtime...
hello is ready!
Project "hello" is now running.
```

The build warns that the app has no icons: without them, browsers do not propose to install
it. You can ignore this warning.

Your browser shows the app at `http://127.0.0.1:5005/hello/`. It displays the environment
the runtime gave it: the runtime's address, the project's name, the app's manifest, the
languages and, when someone is signed in, the user.

## Step 3: Write a process

A process is the server-side logic of your project. Create the file
`processes/greet.process.ts`:

```ts
// processes/greet.process.ts
import { process } from '@codenotch/process';

export const greet = process({
    id: 'Greet',
    description: 'Greets someone by name',
    auth: { scope: 'public' },
    run: async (ctx, input: { name: string }): Promise<{ message: string }> => {
        ctx.log.info('greeting', { name: input.name });
        return { message: `Hello, ${input.name}!` };
    },
});
```

- `id` identifies the process in the project.
- `auth` says who may start it: `public` means anyone, even without signing in.
- `run` receives `ctx`, the toolbox of the run, and the `input` the caller sends. What it
  returns is the output of the run.
- `ctx.log.info` writes a line to the runtime's console.

## Step 4: Call the process from your app

Replace the content of `apps/index.tsx`:

```tsx
// apps/index.tsx
import React, { useState } from 'react';
import { useCodenotch } from '@codenotch/react';
import { greet } from '../processes/greet.process';

const index: React.FC<{}> = () => {
    const cn = useCodenotch();
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const sayHello = async () => {
        const result = await cn.startProcess(greet, { name });
        setMessage(result.isError ? result.errorMessage : result.output.message);
    };

    return <main>
        <h1>Hello Codenotch</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <button onClick={sayHello}>Say hello</button>
        <p>{message}</p>
    </main>;
};

export default index;
```

The app imports the process to get a typed handle on it: `startProcess` knows that `greet`
takes a `name` and returns a `message`. The code of the process never reaches the browser:
it runs on the runtime. `startProcess` starts a run and waits for its output.

## Step 5: Deploy your changes

```bash
cn project refresh
```

`refresh` compiles the project again and sends the changes to the runtime. Reload the page in
your browser, type your name and click **Say hello**: the page shows `Hello, Ada!`.

## Step 6: Run the process from the terminal

You can start any process from the terminal too, with its input as JSON:

```bash
cn project run Greet '{"name":"Grace"}'
```

```text
→ 'Greet' started, instance 719a4974-bc5f-49da-bd74-2f65997d4d54
✓ 'Greet' ended in SUCCESS
{
  "message": "Hello, Grace!"
}
```

To see the line your process logged, read the runtime's console:

```bash
cn runtime logs
```

## Step 7: See your runs in the portal

Every runtime has an administration portal. Open it:

```bash
cn portal
```

The local runtime signs you in without a password: on the **Dev Login** page, click **Log as
Internal** to sign in as the administrator. Open **Monitoring**: each run of `Greet` is
there, with its input, its output and each step it took.

## What you did

- You created a project and deployed it to your local runtime.
- You wrote a process, and started it from a React app and from the terminal.
- You saw the runs in the portal.

## Next steps

- [Tour of a project](project-tour.md): what each file of your project is for.
- [Explore the playground](playground.md): one working example for each feature.
- [Tutorial](../tutorials/README.md): build a complete expense approval app.
