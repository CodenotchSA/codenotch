# Step 7: Test your processes

In this step you write tests for the whole flow: an expense is submitted, the manager
approves it, the employee gets the email. The test runner deploys your project in a
throwaway environment, so the tests run without your local runtime and finish in less than
a second.

## Before you begin

- [Step 6: Send an email with a PDF](send-an-email.md).

## Write the tests

Create the file `tests/expenses.test.ts`:

```ts
// tests/expenses.test.ts
import { test, expect, type SentEmail } from '@codenotch/process/testing';

test('an approved expense is recorded and its employee receives the receipt', async (env) => {
    await env.table('Expense').seed([]);
    const sent: SentEmail[] = [];
    env.email().mock({ send: (message) => { sent.push(message); } });
    env.mock('render.template', (args) => args.kind === 'pdf'
        ? { kind: 'pdf', rendering: { renderingId: 'receipt-1', filename: 'receipt.pdf', contentType: 'application/pdf', sizeBytes: 1000 } }
        : { kind: 'email', payload: { subject: 'Your expense was approved', html: '<p>Approved</p>' } });

    const employee = await env.user({ email: 'ada@example.com' });
    const submit = await env.start<{ id: string }>('SubmitExpense', {
        input: { description: 'Train to Geneva', amount: '42.50' },
        user: employee,
    });
    const { id } = await submit.output();

    const [approval] = await env.runs('ApproveExpense');
    const [task] = await approval.activityCalls('userTask.create');
    await env.userTask(task.id).complete({ decision: 'approve', comment: 'Thanks!' });

    expect(await approval.output()).toEqual({ status: 'Approved' });
    expect(await env.table('Expense').rows()).toContainMatch({ Id: id, Status: 'Approved' });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toContain({ to: ['ada@example.com'] });
});

test('an amount that is not positive is refused', async (env) => {
    const employee = await env.user({ email: 'grace@example.com' });
    const run = await env.start('SubmitExpense', {
        input: { description: 'Lunch', amount: '-5' },
        user: employee,
    });

    expect(await run.state()).toBe('ERROR');
    expect(await run.failure()).toContain({ code: 'expense.invalidAmount' });
});
```

What each part does:

- `env` is the test environment: your project, deployed with an empty database.
- `env.table('Expense').seed([])` empties the table. The database is not reset between
  tests, so seed every table a test depends on.
- `env.email().mock(…)` replaces the email connector: nothing is sent, and the test keeps
  what would have been.
- `env.mock('render.template', …)` replaces the rendering of the templates, so the test
  needs no browser to print a PDF.
- `env.user(…)` creates a user, and `env.start` starts a process as that user: the process's
  `auth` is checked exactly as in production. Users stay for the following tests of the run:
  give each test its own email.
- `env.runs('ApproveExpense')` finds the run the signal started, and `activityCalls` the
  task it created. `env.userTask(id).complete(…)` answers the task as a manager would: the
  form is checked, and the waiting run continues.
- `expect` checks what happened: the output of the run, the row of the table, the email.

## Run the tests

```bash
cn project test
```

```text
Testing expenses 0.1.0 with Codenotch 1.1.0+212a8e963000651dd2c9a3d1e22ac128a2fb4671 — 1 file

tests/expenses.test.js
  PASS  an approved expense is recorded and its employee receives the receipt  (589ms)
  PASS  an amount that is not positive is refused  (86ms)

2 passed
```

The CLI also writes the full report to `tests/test-report.json`: each test, and for a failure,
the values compared and the journal of every run it caused.

To run one test, give its file and its line: `cn project test tests/expenses.test.ts:3`.

## What you did

- You tested the whole flow, a person's decision included, in less than a second.
- You replaced the email connector and the rendering with mocks.

## Next steps

- [Step 8: Deploy to a server](deploy.md).
- [Test your processes](../build/testing.md): everything the test environment can do,
  including moving the clock forward.
