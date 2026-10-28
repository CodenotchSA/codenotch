# Step 1: Create the project

In this step you create the project, describe it in its manifest, and make its app private
to your organisation. At the end, the app runs on your local runtime behind a sign-in.

## Before you begin

- [Install the tools](../get-started/install.md).

## Create the project

```bash
cn project new -t default -p expenses
cd expenses
```

The CLI creates the `expenses` folder, writes the files of an empty project and installs its
npm packages.

## Describe the project

Open `manifest.json` and replace its content:

```json
{
    "title": "Expenses",
    "name": "expenses",
    "uid": "com.example.expenses",
    "uri": "expenses",
    "version": "0.1.0",
    "languages": ["en"],
    "roles": [
        { "name": "Manager", "description": "Approves or rejects the expenses of the team." }
    ],
    "parameters": [],
    "index": "index"
}
```

- `title` is the name people read in the portal.
- `name` and `uri` identify the project on the runtime: its app answers at `/expenses/`.
- `uid` identifies the project wherever it is installed. Use your own domain, reversed.
- `roles` declares the roles of the project. You give the `Manager` role to the people who
  approve expenses; the approval step uses it in [Step 5](add-an-approval.md).

## Make the app private

The template's app is open to anyone. Expenses are for your staff only. Open
`apps/index.manifest.json` and replace its content:

```json
{
    "app": { "name": "index" },
    "html": { "title": "Expenses" },
    "auth": { "scope": "internal" }
}
```

`"scope": "internal"` lets only your organisation's users open the app: a visitor who is not
signed in is sent to the sign-in page first. See [Control who opens an
app](../build/apps/access-and-sign-in.md).

## Run the project

```bash
cn project start
```

The CLI compiles the project, deploys it to your local runtime and opens
`http://127.0.0.1:5005/expenses/` in your browser. Since the app is internal, the runtime
asks you to sign in first. The local runtime signs you in without a password: on the sign-in
page, choose **admin@example.com**. You are now an internal user and the administrator of the
runtime, and the app shows the environment it received.

> [!TIP]
> Keep `cn watch` running in a second terminal while you follow this tutorial. It keeps the
> generated types up to date, so your editor knows your tables as soon as you declare them.
> The VS Code extension does it for you.

## What you did

- You created the project and declared the `Manager` role.
- You made the app internal: only signed-in staff open it.

## Next steps

- [Step 2: Store expenses in a table](store-data.md).
