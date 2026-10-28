# What is Codenotch

Codenotch is a platform for building business applications: the processes that run your
operations, the data they work on, and the web apps your team and your customers use. You
write all of it as one project, in TypeScript. The Codenotch runtime deploys the project and
runs it, with users and roles, an HTTP API and an administration portal.

## What you build

A Codenotch **project** is a folder of TypeScript sources and a `manifest.json` that names
the project. It holds:

- **Processes**: the server-side logic. A process can last a few milliseconds, like an API
  call, or several months, like an approval that waits for a manager or a subscription that
  renews every month. The runtime keeps every run alive through restarts and new versions.
- **Tables and document stores**: your data, declared in TypeScript. The runtime creates the
  database and updates it when your declarations change.
- **Apps**: React apps that the runtime serves to your users. They start processes and read
  tables.
- **Templates**: the emails and the PDF documents your processes produce.
- **Parameters and connectors**: the settings and the external services (email, SMS,
  payments, an LLM, a database…) that each deployment provides. The project declares what it
  needs; whoever deploys it provides the values.

## What the runtime gives your project

When you deploy a project, the runtime gives it:

- **Durable execution.** The runtime records every step a process takes. After a crash, a
  restart or a new deployment, a run continues exactly where it was.
- **An HTTP API.** A process can answer a route such as `POST /shop/api/orders`. The runtime
  serves an OpenAPI description of the project's API.
- **Users, roles and access rules.** People sign in through your identity provider. Each
  process, table and app declares who may use it.
- **Connectors.** Your code sends an email or takes a payment through a connector; an
  administrator chooses the provider behind it.
- **Human steps.** A process can give a task to a person, with a form, and wait for the
  answer.
- **An administration portal.** Install projects, follow every run step by step, manage
  users, API tokens and connectors.

## How you work

1. You install the `cn` command-line tool, and the VS Code extension if you use VS Code.
2. `cn` creates a project and runs it on a runtime on your own machine. You change your
   code, deploy it again in a few seconds and see the result.
3. You test your processes with a test runner that controls time, so a three-day wait takes
   no time at all.
4. You deploy the project to the runtime your operators run in production.

Coding agents such as Claude Code can work with you: a runtime has an MCP endpoint through
which an agent deploys a project, starts its processes and reads what happened. Your project
can serve AI agents too: each project has an MCP endpoint of its own, with the tools its
processes declare.

## Where to go next

| You are… | Start with |
| --- | --- |
| A developer discovering Codenotch | [Quickstart](../get-started/quickstart.md), then the [tutorial](../tutorials/README.md) |
| An administrator of a Codenotch runtime | [Portal guide](../portal/README.md) |
| An operator who installs Codenotch for a team | [Operate](../operate/README.md) |

## Next steps

- [What you can build](use-cases.md): the kinds of applications Codenotch is made for.
- [How Codenotch works](how-it-works.md): the runtime, projects and processes in more detail.
- [Quickstart](../get-started/quickstart.md): your first project in a few minutes.
