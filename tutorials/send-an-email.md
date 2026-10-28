# Step 6: Send an email with a PDF

In this step the employee hears about the decision: `ApproveExpense` sends an email, with a
PDF receipt when the expense is approved. You write the two templates, connect the project to
an email service, and receive the email in a test mailbox on your machine.

## Before you begin

- [Step 5: Add an approval step](add-an-approval.md).

## Install react-email

The email template uses [react-email](https://react.email) to write the message as React
components:

```bash
npm install @react-email/components @react-email/render
```

## Write the email template

A template is a file of the `templates/` folder whose default export comes from
`@codenotch/process/template`. Create `templates/decision.email.tsx`:

```tsx
// templates/decision.email.tsx
import { template } from '@codenotch/process/template';
import { render } from '@react-email/render';
import { Body, Container, Heading, Html, Text } from '@react-email/components';

export interface DecisionData {
    description: string;
    amount: string;
    approved: boolean;
    comment: string;
}

function DecisionEmail(data: DecisionData) {
    const decision = data.approved ? 'approved' : 'rejected';
    return (
        <Html lang="en">
            <Body style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                <Container>
                    <Heading as="h2">Your expense was {decision}</Heading>
                    <Text>{data.description}: {data.amount}</Text>
                    {data.comment ? <Text>Your manager's comment: {data.comment}</Text> : null}
                    {data.approved ? <Text>Your receipt is attached to this email.</Text> : null}
                </Container>
            </Body>
        </Html>
    );
}

export default template.email(async (data: DecisionData) => ({
    subject: `Your expense was ${data.approved ? 'approved' : 'rejected'}`,
    html: await render(<DecisionEmail {...data} />),
    text: await render(<DecisionEmail {...data} />, { plainText: true }),
}));
```

`template.email` takes a function from your data to the message: its subject, its HTML and
its plain text. Keep that function free of side effects: data in, message out.

## Write the PDF template

A PDF template returns HTML, which the runtime prints with Chromium, with your print CSS.
Create `templates/receipt.pdf.tsx`:

```tsx
// templates/receipt.pdf.tsx
import { template } from '@codenotch/process/template';
import { renderToStaticMarkup } from 'react-dom/server';

export interface ReceiptData {
    id: string;
    employee: string;
    description: string;
    amount: string;
    approvedOn: string;
}

function Receipt(data: ReceiptData) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <style>{'body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; } td { padding: 4px 16px 4px 0; }'}</style>
            </head>
            <body>
                <h1>Expense receipt</h1>
                <table>
                    <tbody>
                        <tr><td>Reference</td><td>{data.id}</td></tr>
                        <tr><td>Employee</td><td>{data.employee}</td></tr>
                        <tr><td>Description</td><td>{data.description}</td></tr>
                        <tr><td>Amount</td><td>{data.amount}</td></tr>
                        <tr><td>Approved on</td><td>{data.approvedOn}</td></tr>
                    </tbody>
                </table>
            </body>
        </html>
    );
}

export default template.pdf({ format: 'A4', margins: '20mm' }, (data: ReceiptData) => ({
    html: '<!doctype html>' + renderToStaticMarkup(<Receipt {...data} />),
}));
```

## Preview a template

You can render a template on your machine, without deploying anything:

```bash
cn project preview decision.email '{"description":"Train to Geneva","amount":"42.50","approved":true,"comment":"Thanks!"}' -o preview.html
```

Open `preview.html` in your browser to see the email. `cn project preview decision.email
--sample` prints the data the template takes, with every value empty.

## Declare the email connector

The project sends email through a **connector**. It declares which kind of connector it
needs; whoever deploys it chooses the email service. In `manifest.json`, replace
`"parameters": []`:

```json
    "parameters": [
        { "name": "mailer", "type": "connector", "kind": "email", "description": "Sends the decision emails." }
    ],
```

## Send the email

Replace the content of `processes/approve-expense.process.ts`:

```ts
// processes/approve-expense.process.ts
import { process, signal } from '@codenotch/process';
import decisionEmail from '../templates/decision.email';
import receiptPdf from '../templates/receipt.pdf';

export const approveExpense = process({
    id: 'ApproveExpense',
    description: 'Asks a manager to decide on an expense, then tells the employee',
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
        const approved = answer.decision === 'approve';
        const status = approved ? 'Approved' : 'Rejected';
        await ctx.tables.Expense.write(input.id, { Status: status, Comment: answer.comment ?? null });

        const email = await ctx.render.email(decisionEmail, {
            description: expense.Description,
            amount: expense.Amount,
            approved,
            comment: answer.comment ?? '',
        });

        if (approved) {
            const receipt = await ctx.render.pdf(receiptPdf, {
                id: input.id,
                employee: expense.EmployeeEmail,
                description: expense.Description,
                amount: expense.Amount,
                approvedOn: ctx.now().toISOString().substring(0, 10),
            }, { filename: `expense-${input.id}.pdf`, tags: ['expense'] });
            await email.send({ to: expense.EmployeeEmail, attachments: [receipt] });
        } else {
            await email.send({ to: expense.EmployeeEmail });
        }

        return { status };
    },
});
```

- The process imports the templates: `ctx.render.email` and `ctx.render.pdf` check the data
  you give against the type each template declares.
- `ctx.render.email` returns the message, and its `send` hands it to the project's email
  connector, `mailer`: the only one the manifest declares, so the code does not name it.
- `ctx.render.pdf` prints the receipt and **stores** it on the runtime. You get a reference,
  not the bytes: pass it in `attachments`, and the runtime attaches the file.

## Receive the email on your machine

To see the emails without sending real ones, run a test mailbox. MailDev runs with Node.js:

```bash
npx maildev@2
```

It receives email on port 1025 (SMTP) and shows it at `http://localhost:1080`. Keep it
running.

> [!TIP]
> If port 1025 is already taken, run `npx maildev@2 --smtp 2525` and use `2525` as the port
> below.

Register MailDev as an email connector of your local runtime, then bind the project's
`mailer` parameter to it:

```bash
cn runtime params set maildev --type connector --connector '{"kind":"email","provider":"smtp","settings":{"host":"localhost","port":"1025","security":"none","fromAddress":"expenses@example.com","fromName":"Expenses"}}'
cn project refresh
cn project params set mailer --ref maildev
```

The connector belongs to the runtime: any project can bind to it. You can do the same in the
portal, on the **Connectors** page and on the project's page.

## Try it

1. In the app, submit an expense.
2. In the portal, approve its task, as in [Step 5](add-an-approval.md).
3. Open `http://localhost:1080`: the email `Your expense was approved` is there, with the
   receipt `expense-<id>.pdf` attached.

The portal's **Renderings** page lists every stored PDF; `cn project renderings` does the
same in the terminal.

## What you did

- You wrote an email template and a PDF template, and previewed one on your machine.
- You declared an email connector and bound it to a test mailbox.
- Your process rendered a stored PDF and attached it to an email.

## Next steps

- [Step 7: Test your processes](test-the-processes.md).
