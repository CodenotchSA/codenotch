# Tour of a project

A Codenotch project is a folder of TypeScript sources with a `manifest.json` at its root.
This page walks through the files of a new project, the folders you add as it grows, and
the files the CLI generates for you.

## The files of a new project

`cn project new -t default` creates six files:

```text
hello/
├── manifest.json            the project: its name, address, roles, languages, parameters
├── package.json             its npm packages and scripts
├── tsconfig.json            the TypeScript settings
├── .gitignore               what git leaves out: generated and build files
└── apps/
    ├── index.tsx            a React app
    └── index.manifest.json  the app's manifest: its name, its title, who may open it
```

The `package.json` scripts call `cn` for you: `npm start` runs `cn project start`,
`npm run dev` runs `cn react dev` and `npm run build` runs `cn project compile`.

## The manifest

`manifest.json` names the project and declares what the code cannot say by itself:

```json
{
    "title": "hello",
    "name": "hello",
    "uid": "com.codenotch.hello",
    "uri": "hello",
    "version": "0.0.0",
    "languages": ["en", "de", "fr"],
    "roles": [
        { "name": "Dev", "description": "Role used for developers." },
        { "name": "Admin", "description": "Role used for administrators." }
    ],
    "parameters": [],
    "index": "index"
}
```

| Key | What it is |
| --- | --- |
| `title` | The name people read, in the portal |
| `name` | The name of the project on the runtime: lowercase letters, digits and `_`, starting with a letter |
| `uid` | The identity of the project, wherever it is installed: three segments separated by dots. Replace `com.codenotch` with your own, such as `com.example.hello` |
| `uri` | The first segment of the project's addresses: `/hello/…`. Lowercase letters, digits and `-` |
| `version` | The version of the project. `cn project bump` raises it |
| `languages` | The languages of the project's apps and translations |
| `roles` | The roles your apps and processes can require, such as `Manager` |
| `parameters` | The values each deployment provides: see [Parameters](../build/integrations/parameters.md) |
| `index` | The app the runtime serves at the root of the project, `/hello/` |

You never list your processes, tables, document stores, apps or templates in the manifest:
the CLI finds them in your sources when it compiles the project. The manifest is strict: a key it does not know
fails the deployment, and `cn validate` tells you which key you most likely meant.

Every key is described in the [manifest reference](../reference/manifest.md).

## The folders you add

As the project grows, you add files in folders named by convention. The CLI finds most of
them wherever they are, by their content and their file name:

| Folder | What it holds | File names |
| --- | --- | --- |
| `processes/` | [Processes](../build/processes/README.md): the server-side logic | `*.process.ts` |
| `tables/` | [Table](../build/data/tables.md) declarations | `*.table.ts` |
| `activities/` | [Activities](../build/processes/activities.md): Node.js code that processes call | `*.activity.ts` |
| `apps/` | [React apps](../build/apps/README.md), each next to its manifest | `<app>.tsx` and `<app>.manifest.json` |
| `templates/` | [Email and PDF templates](../build/renderings.md). They must be in this folder | `*.email.tsx`, `*.pdf.tsx` |
| `documents/` | [Document store](../build/data/document-stores.md) declarations | `*.document.ts` |
| `tests/` | [Tests](../build/testing.md) of your processes | `*.test.ts` |
| `assets/` | Images your app manifests use: logos and icons | |
| any folder | [Translations](../build/apps/translations.md): one row per text, one column per language | `*.i18n.csv` |

## The files the CLI generates

Some files derive from your sources. The CLI writes them in the `generated/` folder:

| File | What it holds |
| --- | --- |
| `db-schema.xml` | The database schema, from your table declarations. The runtime migrates the database to it |
| `db-schema.d.ts` | The TypeScript types of your tables, for your processes |
| `db-client-context.ts` | Your tables, for your apps' queries |
| `doc-schema.json` | The shape of each document store, from your `defineDocument()` declarations. The runtime refuses a write that does not fit it |
| `doc-schema.d.ts`, `client-docs.d.ts` | The TypeScript types of your document stores, for your processes and for your apps |
| `process-params.d.ts` | The types of `ctx.params`, from the manifest's parameters |
| `client-params.d.ts` | The types of the parameters your apps can read |
| `openapi.json` | The OpenAPI description of your processes' HTTP routes |
| `<name>.i18n.ts` | One class per translation file, with one method per text |

Never edit these files: the CLI writes them again at each compile. Keep them up to date while
you work, so that your editor knows your tables and parameters:

```bash
cn watch
```

`cn watch` regenerates what a saved file changes, until you stop it with Ctrl+C. The VS Code
extension does the same on its own.

The `generated/` folder is in `.gitignore`: it is not part of your sources.

## The schema history

When you rename or remove a table or a column, the project records it in
`schema-history.json`, next to the manifest, so that every database the project is deployed
to goes through the same change. The file appears with its first entry, which you write
with `cn project history`. It is part of your sources: keep it in git, and never edit or
reorder its entries. See [Change a table safely](../build/data/schema-changes.md).

## The build folder

The CLI builds in the `.codenotch/` folder: the compiled project, the package
`.codenotch/build.zip` that `cn project package` produces, and a copy used by the tests. It
is in `.gitignore` too.

## Next steps

- [Explore the playground](playground.md): a project that uses every folder of this page.
- [Tutorial](../tutorials/README.md): build a complete app, one folder at a time.
