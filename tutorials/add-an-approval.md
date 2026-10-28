# Step 5: Add an approval step

In this step a manager decides on each expense. A second process, `ApproveExpense`, starts
when an expense is submitted, gives the manager a task with a form, waits for the decision
and records it.

## Before you begin

- [Step 4: Build the React page](build-the-page.md).

## Why a second process

An approval can take days. The page cannot wait that long for `SubmitExpense` to end: it
waits 30 seconds at most. So `SubmitExpense` records the expense, announces it with a
**signal**, and ends at once. `ApproveExpense` starts on that signal and waits for the
manager, as long as it takes.

## Send a signal

In `processes/submit-expense.process.ts`, send a signal after the write, and update the
description:

```ts
// processes/submit-expense.process.ts
import { process, ProcessError } from '@codenotch/process';

export const submitExpense = process({
    id: 'SubmitExpense',
    description: 'Records an expense and starts its approval',
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

        await ctx.sendSignal('expenses.submitted', { id });
        return { id };
    },
});
```

A signal is a named message of your project. `ctx.sendSignal` broadcasts it with a payload,
here the id of the expense; every process that listens to `expenses.submitted` hears it.

## Ask the manager

Create the file `processes/approve-expense.process.ts`:

```ts
// processes/approve-expense.process.ts
import { process, signal } from '@codenotch/process';

export const approveExpense = process({
    id: 'ApproveExpense',
    description: 'Asks a manager to decide on an expense',
    auth: { scope: 'system' },
    trigger: signal('expenses.submitted'),
    run: async (ctx, input: { id: string }): Promise<{ status: string }> => {
        const expense = await ctx.tables.Expense.require(input.id);

        const task = await ctx.userTask({
            title: `Expense: ${expense.Description}`,
            description: 'Approve or reject this expense.',
            assign: { role: 'Manager' },
            dueIn: { days: 2 },
            tags: ['expense'],
            context: { employee: expense.EmployeeEmail, description: expense.Description, amount: expense.Amount },
            form: {
                fields: [
                    {
                        key: 'decision', type: 'select', label: 'Decision', required: true,
                        options: [{ value: 'approve', label: 'Approve' }, { value: 'reject', label: 'Reject' }],
                    },
                    { key: 'comment', type: 'textarea', label: 'Comment', maxLength: 500 },
                ],
            },
        });

        const outcome = await task.outcome;
        const answer = outcome.output as { decision: 'approve' | 'reject'; comment?: string };
        const status = answer.decision === 'approve' ? 'Approved' : 'Rejected';
        await ctx.tables.Expense.write(input.id, { Status: status, Comment: answer.comment ?? null });

        return { status };
    },
});
```

- `trigger: signal('expenses.submitted')` starts a run for each signal. The run's `input` is
  the payload of the signal.
- `auth: { scope: 'system' }`: no person starts this process; only its trigger does.
- `ctx.tables.Expense.require(id)` reads the row, and fails the run if it does not exist.
- `ctx.userTask` creates a task assigned to the holders of the `Manager` role, with a form
  and, beside it, the expense as read-only context. `dueIn` sets its deadline: the portal
  shows overdue tasks.
- `await task.outcome` waits for the decision. The run can wait for days: it survives
  restarts and new deployments of your project.
- The second `write` only changes the two columns it names: the row exists, so the write
  updates it.

## Approve an expense

```bash
cn project refresh
```

1. In the app, submit an expense, such as `Hotel in Bern` for `120.00`.
2. Open the portal with `cn portal`, then **Tasks**. The task is under **All tasks**:
   as an administrator, you see every task. It shows the expense beside the form.
3. Choose **Approve**, write a comment and click **Complete task**.
4. Reload the app: the expense is `Approved`.

> [!NOTE]
> The task is assigned to the `Manager` role. In real use, give that role to your managers
> on the portal's **Users** page: they find the tasks in their **Queue** and claim them.

## What you did

- You split the work in two processes linked by a signal.
- You gave a person a task with a form, and waited for the answer.

## Next steps

- [Step 6: Send an email with a PDF](send-an-email.md).
