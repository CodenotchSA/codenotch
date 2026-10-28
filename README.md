# Codenotch documentation

Codenotch is a platform to build and run business applications. You write a **project**:
durable processes for the server-side logic, tables for the data, React apps for the
interface. The Codenotch **runtime** deploys it and runs it, with an HTTP API, users and
roles, connectors to external services and an administration portal. This documentation
takes you from your first project to running Codenotch in production.

> [!WARNING]
> **Closed beta.** Codenotch is pre-release software, made available for a limited period for
> testing only. It does not comply with the EU Cyber Resilience Act (Regulation (EU) 2024/2847)
> and is not made available for any other purpose: do not use it in production or with real
> personal data.

## Where to start

| You want to… | Start here |
| --- | --- |
| Understand what Codenotch is | [Introduction](introduction/README.md) |
| Build your first project in a few minutes | [Quickstart](get-started/quickstart.md) |
| Learn step by step, with a complete app | [Tutorial: build an expense approval app](tutorials/README.md) |
| Find how to do something in a project | [Build](build/README.md) |
| Administer a runtime from its portal | [Portal guide](portal/README.md) |
| Install and run Codenotch for your team | [Operate](operate/README.md) |
| Look up a command, an option or an endpoint | [Reference](reference/README.md) |

## Table of contents

### Introduction

- [What is Codenotch](introduction/README.md)
- [What you can build](introduction/use-cases.md)
- [How Codenotch works](introduction/how-it-works.md)

### Get started

- [Overview](get-started/README.md)
- [Install the tools](get-started/install.md)
- [Quickstart: your first project](get-started/quickstart.md)
- [Tour of a project](get-started/project-tour.md)
- [Explore the playground](get-started/playground.md)

### Tutorial: build an expense approval app

- [Overview](tutorials/README.md)
- [Step 1: Create the project](tutorials/create-the-project.md)
- [Step 2: Store expenses in a table](tutorials/store-data.md)
- [Step 3: Write your first process](tutorials/write-a-process.md)
- [Step 4: Build the React page](tutorials/build-the-page.md)
- [Step 5: Add an approval step](tutorials/add-an-approval.md)
- [Step 6: Send an email with a PDF](tutorials/send-an-email.md)
- [Step 7: Test your processes](tutorials/test-the-processes.md)
- [Step 8: Deploy to a server](tutorials/deploy.md)

### Build

- [Overview](build/README.md)
- Processes
  - [What a process is](build/processes/README.md)
  - [Start a process: triggers](build/processes/triggers.md)
  - [Durable execution and the replay rule](build/processes/durable-execution.md)
  - [Wait, signal and combine](build/processes/waits-and-signals.md)
  - [Call other processes](build/processes/calling-processes.md)
  - [Limit concurrent runs](build/processes/concurrency.md)
  - [Call an HTTP API](build/processes/http-calls.md)
  - [Run Node.js code in activities](build/processes/activities.md)
  - [Handle errors and compensate](build/processes/errors.md)
  - [Ephemeral processes](build/processes/ephemeral-processes.md)
  - [Deploy new code to running processes](build/processes/versioning.md)
  - [The standard library](build/processes/standard-library.md)
- Data
  - [Tables and document stores](build/data/README.md)
  - [Declare a table](build/data/tables.md)
  - [Read and write records](build/data/read-and-write.md)
  - [Write in transactions and in bulk](build/data/transactions-and-bulk-writes.md)
  - [Query your data](build/data/queries.md)
  - [Document stores](build/data/document-stores.md)
  - [Control who can read your data](build/data/access-policies.md)
  - [Change a table safely](build/data/schema-changes.md)
  - [React to data changes](build/data/change-signals.md)
- Apps
  - [Web apps in a project](build/apps/README.md)
  - [Build a React app](build/apps/react.md)
  - [Control who opens an app](build/apps/access-and-sign-in.md)
  - [Translate your project](build/apps/translations.md)
  - [Make an app installable](build/apps/installable-apps.md)
  - [Send push notifications](build/apps/push-notifications.md)
- Your project's API
  - [Expose an API](build/project-api/README.md)
  - [Routes](build/project-api/routes.md)
  - [Requests, responses and errors](build/project-api/requests-and-responses.md)
  - [Call your API from another site](build/project-api/cors.md)
  - [Stream live updates](build/project-api/streaming.md)
  - [Expose tools to AI agents](build/project-api/agent-tools.md)
- Parameters and connectors
  - [Parameters](build/integrations/parameters.md)
  - [Connectors](build/integrations/README.md)
  - [Use an LLM](build/integrations/llm.md)
  - [Sign with a private key](build/integrations/signing-keys.md)
  - [Query an external database](build/integrations/external-databases.md)
- Payments and monetization
  - [Overview](build/monetization/README.md)
  - [Take payments](build/monetization/payments.md)
  - [Subscriptions](build/monetization/subscriptions.md)
  - [Credits](build/monetization/credits.md)
  - [Usage meters](build/monetization/meters.md)
- More building blocks
  - [Render emails and PDFs](build/renderings.md)
  - [Ask a person: user tasks](build/user-tasks.md)
  - [Create tenants for your customers](build/managed-tenants.md)
- Test and ship
  - [Test your processes](build/testing.md)
  - [Deploy your project](build/deploy.md)
  - [Automate with CI](build/ci.md)
  - [Work with a coding agent](build/coding-agents.md)

### Portal guide

- [The portal](portal/README.md)
- [Install and manage projects](portal/projects.md)
- [Monitor process runs](portal/monitoring.md)
- [Work on tasks](portal/tasks.md)
- [Users, roles and invitations](portal/users.md)
- [API tokens](portal/api-tokens.md)
- [Connectors, parameters and hosted files](portal/connectors.md)
- [Webhooks](portal/webhooks.md)
- [Monetization](portal/monetization.md)
- [Data explorer and renderings](portal/data.md)
- [Audit trail](portal/audit-trail.md)
- [System and configuration](portal/configuration.md)
- [The assistant](portal/assistant.md)

### Operate

- [Overview: what a deployment is made of](operate/README.md)
- [Run a development runtime](operate/development-runtime.md)
- [Run in production with Docker Compose](operate/docker-compose.md)
- [Run on Kubernetes](operate/kubernetes.md)
- [Sign-in and identity providers](operate/authentication.md)
- [Secure a deployment](operate/security.md)
- [License](operate/license.md)
- [Logs, metrics and traces](operate/telemetry.md)
- [Memory and activity workers](operate/memory.md)
- [Serve project packages from a package store](operate/package-stores.md)
- [Prepare a cluster for managed tenants](operate/managed-tenants.md)
- [Start, stop and update](operate/maintenance.md)

### CLI

- [The `cn` command](cli/README.md)
- [`cn project`](cli/project.md)
- [`cn runtime`](cli/runtime.md)
- [`cn generate`](cli/generate.md)
- [`cn react` and the other commands](cli/other-commands.md)

### VS Code extension

- [Overview and installation](vscode/README.md)
- [The Codenotch panel](vscode/panel.md)
- [Editors: manifests, translations, CNQL](vscode/editors.md)
- [Help while you code](vscode/code-assistance.md)
- [Run tests](vscode/tests.md)
- [Commands, settings and troubleshooting](vscode/settings.md)

### Platform API

- [Overview](platform-api/README.md)
- [Authenticate with API tokens](platform-api/api-tokens.md)
- [Follow a process run](platform-api/following-runs.md)
- [The MCP endpoint](platform-api/mcp.md)

### Reference

- [Overview](reference/README.md)
- [Project manifest and app manifest](reference/manifest.md)
- [Process API](reference/process-api.md)
- [Testing API](reference/testing-api.md)
- [React API](reference/react-api.md)
- [Tables and queries](reference/orm.md)
- [CNQL](reference/cnql.md)
- [Configuration variables](reference/configuration.md)
- [The `codenotch` executable](reference/executable.md)

### Appendix

- [Glossary](appendix/glossary.md)
- [Troubleshooting](appendix/troubleshooting.md)
- [Release notes](appendix/release-notes.md)
