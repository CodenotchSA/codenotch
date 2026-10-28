# Step 8: Deploy to a server

In this last step you put the app in the hands of your team: you package the project, install
it on your organisation's runtime, connect its email, and give the `Manager` role to your
managers.

## Before you begin

- [Step 7: Test your processes](test-the-processes.md).
- A Codenotch runtime run by your organisation, with an administrator account. To install
  one, see [Operate](../operate/README.md).

## Package the project

```bash
cn project package
```

```text
✓ Compilation complete
Project built successfully at /Users/ada/expenses/.codenotch/build.zip
```

The package is one zip file: your compiled processes, your built app, your templates and the
schema of your table. It holds no secret and no setting of your machine: the same package
installs on any runtime.

## Install it on the server

`cn` deploys to your local runtime only. To install the package on your organisation's
runtime, use its portal or its API.

<!-- gap D6: replace this section if the CLI gains a remote target -->

### From the portal

1. Sign in to the portal of the runtime, at `https://<your-runtime>/portal`, as an
   administrator.
2. Open **Projects** and click **Install project**.
3. Choose **Upload**, pick `.codenotch/build.zip` and click **Install**.

### From a script

The platform API installs a package too, which is what a CI pipeline uses. Create an API
token on the portal's **API tokens** page, with the `tenant:projects:write` scope, then:

```bash
curl -X POST "https://<your-runtime>/project/upload" \
  -H "Authorization: Bearer <api-token>" \
  -F "file=@.codenotch/build.zip" \
  -F "serviceName=expenses" \
  -F "uri=expenses"
```

The runtime answers `202 Accepted` and installs the project. Follow the installation on the
portal's **Projects** page. See [Automate with CI](../build/ci.md).

## Set it up for your team

The project runs, but three things belong to the server, not to the package:

1. **The email connector.** On the **Connectors** page, register your organisation's email
   service (SMTP or SendGrid). Then, on the project's page, bind the `mailer` parameter to
   it.
2. **The managers.** On the **Users** page, give the `Manager` role on the `expenses` project
   to the people who approve expenses. They find the tasks in their **Queue**.
3. **The employees.** Every internal user of the runtime can open the app at
   `https://<your-runtime>/expenses/`. To bring someone new, create the user on the **Users**
   page and send them an invitation with the app as its redirect: once their account is ready,
   they land in the app. See [Users, roles and invitations](../portal/users.md).

## Ship a new version

When you change the project later, raise its version, then package and install it again:

```bash
cn project bump
cn project package
```

Installing a new version keeps the data. The runs that wait for a manager at that moment
keep the code they started with, unless the process asks otherwise: see [Deploy new code to
running processes](../build/processes/versioning.md).

## What you did

You built and shipped a complete Codenotch application:

- a table and its access policy;
- two processes linked by a signal, one of them waiting for a person;
- a React app reading the table and starting a process;
- an email and a PDF rendered from templates, sent through a connector;
- tests of the whole flow;
- a package installed on a server.

## Next steps

- [Build](../build/README.md): every building block in detail.
- [Portal guide](../portal/README.md): what administrators do with your project.
- [Explore the playground](../get-started/playground.md): one example for each feature you
  have not used yet.
