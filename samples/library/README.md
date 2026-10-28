# Team Library

A small Codenotch project: a team shares a shelf of books. Anyone in the team borrows a book from
the app and returns it; a book is due back three weeks later; every morning the library flags the
books still out after their due date, and a member with an overdue book borrows nothing more until
it is back. The librarians (the project's `Admin` role) put new books on the shelf.

It is deliberately ordinary: each piece shows one thing a Codenotch project does, nothing more.

## What is in it

| Piece | What it does | What it exercises |
| --- | --- | --- |
| `tables/books.table.ts`, `tables/loans.table.ts` | the shelf and the loans, a `hasMany`/`belongsTo` pair | `defineEntity`, a managed `CreatedAt`, defaults, nullable columns, access policies by role |
| `processes/seed-library.process.ts` | `SeedLibrary`: five starter books on the first install | `install({ once: true })`, `ctx.data.exec` of upserts in one transaction |
| `processes/add-book.process.ts` | `AddBook`, `POST /books`: a librarian adds a book, ISBN-13 checked | `auth` with a role, `ProcessError` with a status, `ctx.data.write(…).insert` |
| `processes/find-books.process.ts` | `FindBooks`, `GET /books?q=…`, and the MCP tool `find_books` | an ephemeral process, a trigger array with `mcp.tool`, a typed query with `Like`, `orderBy`, `limit` |
| `processes/borrow-book.process.ts` | `BorrowBook`, `POST /books/{bookId}/borrow`: due back `loanDays` later | a path parameter, `ctx.user`, `ctx.params`, a guarded mass `update` read through `affected`, compensation of a failed run |
| `processes/return-book.process.ts` | `ReturnBook`, `POST /loans/{loanId}/return`: by the borrower or a librarian | two updates in one `ctx.data.exec` transaction |
| `processes/flag-overdue-loans.process.ts` | `FlagOverdueLoans`: every day at 07:00, Zurich time | a cron `timer` with a time zone, a mass `update` with `maxAffected: '*'` |
| `lib/isbn.ts` | `isbn13`, the ISBN-13 check of `AddBook` | a plain module a process imports: the compilation inlines it into the bundle |
| `apps/shelf.tsx` | the `shelf` app (internal): my loans, the shelf with a search, the add form for librarians | `@codenotch/react`: `cn.tables` with both lambda styles, `cn.startProcess` on imported processes, `cn.getLoggedUser()` |
| `tests/` | one file per process | `env.start` with users and parameters, seeds, a pinned clock and `env.advance`, failures and refusals |
| `lib/isbn.spec.ts` | the unit tests of `isbn13` | Jest with ts-jest on Node, without the runtime: the `*.spec.ts` files `jest.config.mjs` matches |
| `playwright/` | the end-to-end tests of the app: the shelf, its search, a loan and its return | Playwright in a browser on the deployed project, signed in through the dev login of the runtime |

## Run it

It needs Node, the `cn` command of `@codenotch/cli` at the version of the `@codenotch` packages in
`package.json`, and a local runtime: `cn runtime install` downloads one and `cn runtime start` runs
it, as the user guide of the CLI describes. Then, in this folder:

```bash
npm install
npm run test:unit
cn project compile
cn project test
cn project start
```

`npm run test:unit` runs the unit tests of `lib/isbn.ts` with Jest, on Node alone. `cn project test`
runs the process tests on the runtime installed under `~/.codenotch`, or under `CODENOTCH_PATH`.
`cn project start` deploys the project to the running runtime and opens the app at
`/library/shelf/`; sign in with a user holding the project's `Admin` role to see the add form.

The end-to-end tests of the app run with Playwright on the deployed project (`playwright.config.ts`:
the `*.spec.ts` files of `playwright/`, against the address in `CODENOTCH_PROJECT_URL`). They sign
in through the dev login of the runtime, as its internal user `admin@example.com`: they need a
development host with a license, since without one it answers 503 to a deployed project. Once the
project is deployed, with the address of the runtime (`cn runtime info` gives it):

```bash
npx playwright install chromium
CODENOTCH_PROJECT_URL=http://localhost:5005/library/ npm run test:playwright
```

## By hand, once deployed

- `GET /library/api/books?q=martin` searches the shelf.
- The MCP server at `/library/mcp` offers `find_books` to an agent with a token on the project.
- `loanDays` (21 by default) is a parameter of the deployment: `cn project params set loanDays 7`.
