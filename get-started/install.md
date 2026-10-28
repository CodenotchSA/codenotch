# Install the tools

To build Codenotch projects you need two things on your machine: the `cn` command-line tool,
and a Codenotch runtime to run your projects. This page installs both, and the VS Code
extension if you use VS Code.

## Before you begin

- **Node.js 22.13 or later**, with npm. Check your version:

  ```bash
  node --version
  ```

  The runtime uses Node.js to run your [activities](../build/processes/activities.md), so
  the version matters even if you only write processes.
- **A supported system** for the runtime: macOS on Apple silicon, Linux on x64, or Windows
  on x64.
- About 400 MB of free disk space for the runtime.
- **A developer license.** Every runtime needs a license, the one on your machine too.
  Developer licenses are free: during the closed beta, the Codenotch team sends you one.

<!-- gap D1: which platforms we announce -->
<!-- gap D17: how a developer gets a license, and whether the CLI installs it -->

## Install the CLI

The CLI is the `cn` command. Install it with npm:

```bash
npm install -g @codenotch/cli
```

Check that it works:

```bash
cn info
```

```text
Codenotch CLI
- CLI version: 1.1.0
- Node.js version: v24.20.0
- Platform: darwin arm64
- Current directory: /Users/ada
Codenotch runtime
- Not installed: 'cn runtime install' installs it, 'cn project start' proposes it when needed
```

> [!NOTE]
> With npm 11 or later, npm may warn that it did not run the install scripts of some
> packages, such as `esbuild`. You can ignore this warning: Codenotch works without them.

## Install the local runtime

The local runtime is the Codenotch server that runs your projects on your machine. Install
it:

```bash
cn runtime install
```

The CLI downloads the runtime for your system from the public Codenotch releases on GitHub,
and installs it in `~/.codenotch`. You don't need a GitHub account or a sign-in.

Start the runtime:

```bash
cn runtime start
```

```text
Starting Codenotch runtime in detached mode...
Runtime is ready!
Codenotch runtime started successfully
```

The runtime now runs in the background. You don't need to start it by hand next time:
when the runtime is stopped or missing, `cn project start` offers to start or install it.

### Install your license

A runtime without a license starts **restricted**: you can sign in to its portal and install
a license, and every other request answers `503 license.required`, deployments included.
Install your developer license once, from the portal:

1. Open the portal:

   ```bash
   cn portal
   ```

2. On the sign-in page, choose **admin@example.com** to sign in as the administrator.
3. Open **Configuration → License**, then paste the license or choose its file.

The page shows the license as valid, and the runtime serves everything at once. Check it from
the terminal at any time: the `License` line of `cn runtime status` says whether the license
is valid.

A developer license runs a development runtime only: one that signs people in with the
development login, on a single machine, like the local runtime.

### Where the runtime lives

| What | Where |
| --- | --- |
| The runtime and its data | `~/.codenotch` (set `CODENOTCH_PATH` to use another folder) |
| Its address | `http://127.0.0.1:5005`. `cn runtime start -p <port>` starts it on another port, which the next starts keep |
| The portal | `http://127.0.0.1:5005/portal`, or `cn portal` |
| Its console | `cn runtime logs`, or `cn runtime logs -f` to follow it |

The local runtime is a development runtime: it stores its data in SQLite and signs you in
with one click, without a password. Never use it for real data.

To stop it:

```bash
cn runtime stop
```

## Enable command completion (optional)

Completion lets your terminal complete `cn` commands and options with the Tab key. It works
with bash, zsh and PowerShell:

```bash
cn completion --install
```

## Install the VS Code extension (optional)

The Codenotch extension needs VS Code 1.90 or later. During the closed beta, the Codenotch
team sends you the extension as a `.vsix` file. In VS Code, open the command palette, run
**Extensions: Install from VSIX…** and choose the file.

<!-- gap D5: confirm how beta users get the extension -->

The extension finds the `cn` you installed above. If it finds none, it offers to install
one. See [VS Code extension](../vscode/README.md).

## Keep your tools up to date

```bash
cn update            # updates the CLI
cn runtime update    # updates the local runtime
```

A project only deploys to a runtime of the same version as its `@codenotch/process`
package. When `cn` refuses to deploy because the versions differ, update the runtime, or the
package in your project.

A license can be limited to one version of the runtime, such as `1.2.x`: it covers every
patch of that version and no other. When the latest runtime is of a version your license does
not cover, `cn runtime update` asks whether to install it anyway, to install the latest
version your license covers, or to install nothing.

## Next steps

- [Quickstart](quickstart.md): create and run your first project.
