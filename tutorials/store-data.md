# Step 2: Store expenses in a table

In this step you declare the `Expense` table, where the app stores each expense with its
status. The runtime creates the table in its database when you deploy.

## Before you begin

- [Step 1: Create the project](create-the-project.md).

## Declare the table

Create the file `tables/expense.table.ts`:

```ts
// tables/expense.table.ts
import { defineEntity, type InferEntity, p } from '@codenotch/orm';

export const Expense = defineEntity({
    name: 'Expense',
    properties: {
        Id: p.uuid().primary(),
        EmployeeId: p.string(),
        EmployeeEmail: p.email(),
        Description: p.string().maxLength(200),
        Amount: p.decimal(10, 2),
        Status: p.enum(['Submitted', 'Approved', 'Rejected']),
        Comment: p.text().nullable(),
        SubmittedAt: p.datetime(),
    },
    accessPolicy: {
        internal: { _other: { read: 'all', create: 'none', update: 'none', delete: 'none' } },
        external: { read: 'none', create: 'none', update: 'none', delete: 'none' },
        public: { read: 'none', create: 'none', update: 'none', delete: 'none' },
        system: {},
    },
});

export type IExpense = InferEntity<typeof Expense>;
```

### The columns

- `Id` is the primary key, a UUID. Every table has one.
- `EmployeeId` and `EmployeeEmail` record who submitted the expense.
- `Amount` is a decimal with 10 digits, 2 of them after the point. Decimals travel as text,
  such as `"42.50"`, so amounts never lose a cent to floating-point arithmetic.
- `Status` takes one of three values.
- `Comment` is the manager's comment. It is `nullable`: the only column that may stay empty.
  Every other column is required.

The runtime adds three columns of its own to every table: `Id`, `CreatedAt` and `UpdatedAt`.
It fills `CreatedAt` and `UpdatedAt` for you.

### Who can read it

The `accessPolicy` says who may read and change the table, besides the project's own
processes, which always can:

- `internal`: your organisation's users. `_other` stands for any role, so every staff member
  may read every expense, and nobody may change one directly: changes go through processes.
- `external` and `public`: customers and anonymous visitors get nothing.
- `system`: no other project may read it.

A table without an access policy is readable by its project's processes only. See [Control
who can read your data](../build/data/access-policies.md).

### The row type

The last line exports `IExpense`, the type of one row. Your app uses it in
[Step 4](build-the-page.md), and the CLI needs it to type the table everywhere: always export
the row type next to a table.

## Deploy the table

```bash
cn project refresh
```

The runtime creates the table. Check it:

```bash
cn project schema Expense
```

```text
column         type       nullable  unique  relation
Id             Id
CreatedAt      CreatedAt
UpdatedAt      UpdatedAt
EmployeeId     String
EmployeeEmail  Email
Description    String
Amount         Decimal
Status         Enum
Comment        Text       yes
SubmittedAt    DateTime
```

## What you did

- You declared a table in TypeScript, with its columns and its access policy.
- The runtime created it in its database when you deployed.

## Next steps

- [Step 3: Write your first process](write-a-process.md).
