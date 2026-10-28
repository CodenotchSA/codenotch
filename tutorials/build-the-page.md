# Step 4: Build the React page

In this step you build the page employees use: a form to submit an expense, and the list of
their expenses with their status. The page starts `SubmitExpense` and reads the `Expense`
table.

## Before you begin

- [Step 3: Write your first process](write-a-process.md).

## Write the page

Replace the content of `apps/index.tsx`:

```tsx
// apps/index.tsx
import React, { useEffect, useState } from 'react';
import { useCodenotch } from '@codenotch/react';
import { clientDbContext } from '../generated/db-client-context';
import { submitExpense } from '../processes/submit-expense.process';
import type { IExpense } from '../tables/expense.table';

const index: React.FC<{}> = () => {
    const cn = useCodenotch(clientDbContext);
    const me = cn.getLoggedUser();
    const [expenses, setExpenses] = useState<IExpense[]>([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const refresh = async () => {
        if (!me) return;
        const rows = await cn.tables.Expense
            .filter((expense, $) => expense.EmployeeId == $.me, { me: me.id })
            .sort((expense) => expense.SubmittedAt, 'DESC')
            .run();
        setExpenses(rows);
    };

    useEffect(() => { refresh(); }, []);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        const result = await cn.startProcess(submitExpense, { description, amount });
        if (result.isError) {
            setError(result.errorMessage);
            return;
        }
        setError('');
        setDescription('');
        setAmount('');
        await refresh();
    };

    return <main>
        <h1>My expenses</h1>
        <form onSubmit={submit}>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
            <button type="submit">Submit</button>
        </form>
        {error && <p role="alert">{error}</p>}
        <table>
            <thead>
                <tr><th>Description</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
                {expenses.map((expense) => <tr key={expense.Id}>
                    <td>{expense.Description}</td>
                    <td>{expense.Amount}</td>
                    <td>{expense.Status}</td>
                </tr>)}
            </tbody>
        </table>
    </main>;
};

export default index;
```

### Reading the table

`useCodenotch(clientDbContext)` gives the page `cn.tables`, one entry per table of the
project. `clientDbContext` comes from `generated/db-client-context.ts`, which the CLI
generates from your table declarations.

A read is a query you build step by step: `filter` keeps the signed-in employee's expenses,
`sort` puts the newest first, and `run()` sends the query to the runtime. The condition of a
`filter` is translated into a query that runs on the runtime, so it cannot read the
variables of your component: pass them in the second argument and read them as `$`, as
`$.me` above.

The page reads with the rights of the signed-in user, under the table's access policy: the
`internal` users you allowed in [Step 2](store-data.md).

### Starting the process

The page imports `submitExpense` to get a typed handle on the process: `startProcess` knows
its input and its output. The code of the process never reaches the browser.

`startProcess` waits for the run to end. A run that fails does not throw: the result has
`isError` set, and `errorMessage` says why.

## See it work

```bash
cn project refresh
```

Reload the page in your browser. The list shows the expense you submitted from the terminal
in [Step 3](write-a-process.md). Submit a new one, such as `Hotel in Bern` for `120.00`: it
appears at the top of the list, with the status `Submitted`.

Now submit an amount of `-3`. The page shows the error of the run:

```text
Failed to get process result: Error: Process failed: expense.invalidAmount: The amount must be a positive number.
```

<!-- gap G40: output read from the code of main, to confirm by a run; the app receives the error code inside a message, not as a field -->

## What you did

- You built a page that reads a table with a filtered, sorted query.
- You started a process from the page and handled its errors.

## Next steps

- [Step 5: Add an approval step](add-an-approval.md).
