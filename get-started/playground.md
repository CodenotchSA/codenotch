# Explore the playground

The playground is a sample project that ships with the CLI. It has one page per feature of
Codenotch, each with a working example and the sources behind it. Run it to see a feature
in action, then read its code to see how it is built.

## Before you begin

- [Install the tools](install.md).

## Create and run the playground

```bash
cn project new -t playground
cd playground
cn project start
```

The CLI copies the sample into a new `playground` folder, generates its derived files,
installs its npm packages, then deploys it to your local runtime. Your browser opens the
playground's home page at `http://127.0.0.1:5005/playground/`.

The playground keeps its own name, `playground`, and the package versions it ships with. Its
name on the runtime is always `playground`: two copies on one machine deploy over each
other.

## What it shows

The playground's pages are grouped like this documentation:

| Section | Pages | Where to read more |
| --- | --- | --- |
| The app | React, Login, Access, i18n, Parameters, Install and push | [Apps](../build/apps/README.md) |
| Processes | Process, Activity, HTTP API, Composition, Lifecycle | [Processes](../build/processes/README.md), [Your project's API](../build/project-api/README.md) |
| Data | Tables, Records and queries, Documents | [Data](../build/data/README.md) |
| Live | Signals, Changes | [Wait, signal and combine](../build/processes/waits-and-signals.md), [React to data changes](../build/data/change-signals.md) |
| People and billing | User tasks, Credits and subscriptions | [User tasks](../build/user-tasks.md), [Monetization](../build/monetization/README.md) |
| Renderings | Email, Pdf | [Render emails and PDFs](../build/renderings.md) |
| Quality | Tests | [Test your processes](../build/testing.md) |

Each page runs its example against your local runtime and shows the sources it uses.

## Read the sources

The playground is a regular project, organised as described in the [Tour of a
project](project-tour.md):

- `processes/`: 27 process files, from `greet.process.ts`, the simplest one, to processes
  with timers, signals, child processes and HTTP routes. Their comments explain each line.
- `tables/`: five tables, with relations, unique columns, change signals and access
  policies.
- `activities/`: an activity, with its unit test.
- `templates/`: an email template written with react-email, and a PDF template.
- `tests/`: ten test files for the processes, which you run with `cn project test`.
- `apps/`: the playground app itself, and a second app that only your organisation's users
  may open.

> [!TIP]
> Copy freely from the playground into your own projects: its examples follow the
> recommended way of writing each feature.

## Next steps

- [Tutorial](../tutorials/README.md): build a complete app step by step.
- [Build](../build/README.md): every feature in detail.
