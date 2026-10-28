# Step 3: Write your first process

In this step you write `SubmitExpense`, the process that records an expense. You run it from
the terminal and see the row it writes.

## Before you begin

- [Step 2: Store expenses in a table](store-data.md).

## Write the process

Create the file `processes/submit-expense.process.ts`:

```ts
// processes/submit-expense.process.ts
import { process, ProcessError } from '@codenotch/process';

export const submitExpense = process({
    id: 'SubmitExpense',
    description: 'Records an expense',
    auth: { scope: 'internal' },
    run: async (ctx, input: { description: string; amount: string }): Promise<{ id: string }> => {
        if (!(Number(input.amount) > 0)) {
            throw new ProcessError('expense.invalidAmount', { message: 'The amount must be a positive number.' });
        }

        const id = ctx.uuid();
        await ctx.tables.Expense.write(id, {
            EmployeeId: ctx.user.id,
            EmployeeEmail: ctx.user.email ?? '',
            Description: input.description,
            Amount: input.amount,
            Status: 'Submitted',
            SubmittedAt: ctx.now().toISOString(),
        });

        return { id };
    },
});
```

Line by line:

- `auth: { scope: 'internal' }` lets only your organisation's users start the process. The
  runtime checks it before your code runs.
- `ctx.user` is the person who started the run: their id and their email go into the row.
- `ProcessError` ends the run with an error code and a message for the caller. The process
  refuses an amount that is not a positive number before it writes anything.
- `ctx.uuid()` and `ctx.now()` give a new id and the current time. Always use them instead
  of `crypto.randomUUID()` or `new Date()`: the runtime records their values, so the run
  gets the same ones if it ever replays. See [Durable
  execution](../build/processes/durable-execution.md).
- `ctx.tables.Expense.write(id, …)` creates the row, or updates it when it exists. A write
  that creates a row must give every column that is not `nullable`.

## Run it

Deploy the process, then start it from the terminal. `cn project run` starts it as you, the
administrator of your local runtime:

```bash
cn project refresh
cn project run SubmitExpense '{"description":"Train to Geneva","amount":"42.50"}'
```

```text
→ 'SubmitExpense' started, instance bdb3234e-7a56-4f12-8694-2337115b6953
✓ 'SubmitExpense' ended in SUCCESS
{
  "id": "d621eac2-9f51-4203-be49-103ed31947f9"
}
```

Read the table:

```bash
cn project data Expense
```

The row is there, with the status `Submitted`, your email `admin@example.com` and the date.

Now try an amount the process refuses:

```bash
cn project run SubmitExpense '{"description":"Lunch","amount":"-5"}'
```

```text
→ 'SubmitExpense' started, instance 477940a6-69f9-4328-87c6-f0747b9a633e
'SubmitExpense' ended in ERROR
  - [expense.invalidAmount] The amount must be a positive number.
```

<!-- gap G40: output read from the code of main, to confirm by a run -->

The run ended in error and wrote nothing.

## What you did

- You wrote a process that checks its input and writes a row.
- You started it from the terminal and read the table.

## Next steps

- [Step 4: Build the React page](build-the-page.md).
