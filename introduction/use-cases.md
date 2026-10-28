# What you can build

Codenotch is made for applications where work happens in steps, involves people and
external services, and must not get lost along the way. This page shows the kinds of
applications teams build with it, and the features each one relies on.

## Approval workflows

An employee submits an expense, a purchase order or a leave request. A manager approves or
rejects it. Without an answer after two days, the request goes to someone else. Once
approved, the employee receives an email with a PDF.

| You need | Codenotch gives you |
| --- | --- |
| A form for the request | A [React app](../build/apps/react.md) that starts a process |
| A person to decide | A [user task](../build/user-tasks.md) with its own form, in the portal or by link |
| A reminder or an escalation | [Durable timers](../build/processes/waits-and-signals.md) that can wait for days |
| An email with a document | [Email and PDF templates](../build/renderings.md) and an email connector |

The [tutorial](../tutorials/README.md) builds such an application from start to finish.

## Customer apps with payments

A customer orders on your site, pays online and receives an invoice. A subscriber is charged
every month, and loses access when a payment fails.

- [Payments](../build/monetization/payments.md): a checkout page from your payment provider,
  and a process that continues when the payment succeeds or fails.
- [Saved payment methods](../build/monetization/payments.md) for one-click orders and
  renewals.
- [Subscriptions](../build/monetization/subscriptions.md) with renewal, grace period and
  expiry.
- [PDF invoices](../build/renderings.md) stored and served to the customer.

## Long-running follow-ups

Some processes last for weeks: an invoice reminder sequence, a customer onboarding over 30
days, a contract that renews every year. A Codenotch process waits as long as it needs to,
and survives every restart and every new version of your code.

- [Durable execution](../build/processes/durable-execution.md): what makes a run resume
  exactly where it stopped.
- [Deploy new code to running processes](../build/processes/versioning.md): choose, process
  by process, whether runs already in flight keep their code or move to the new one.

## APIs and integrations

Your project exposes an API to partners, receives webhooks from other systems and notifies
them in return.

- [Project API](../build/project-api/README.md): a process answers an HTTP route, with an
  OpenAPI description generated for you.
- [Incoming webhooks](../build/project-api/requests-and-responses.md), with signature
  checks on the raw body.
- [API tokens](../platform-api/api-tokens.md) with scopes and rate limits, for each partner.
- [Outbound webhooks](../portal/webhooks.md): the runtime calls a URL when something happens
  in your project.
- [Live updates](../build/project-api/streaming.md): a page or a device follows changes
  without polling.

## Paid and metered services

You sell access to a service: a number of reports, API calls or generated documents.

- [Credits](../build/monetization/credits.md): prepaid balances that your processes grant
  and spend.
- [Usage meters](../build/monetization/meters.md): usage counted per user and per month, to
  bill afterwards or to cap.
- [API tokens that spend credits](../platform-api/api-tokens.md) on each call.

## AI in your processes

- [Use an LLM](../build/integrations/llm.md) in a process: classify a request, extract data
  from a PDF, draft an answer, with a structured result your code can use.
- Let the [assistant draft a user task](../portal/assistant.md): the person reviews the
  answer before sending it.
- Ask the [portal assistant](../portal/assistant.md) about your deployment.
- [Work with a coding agent](../build/coding-agents.md) that deploys and tests your project
  for you.

## Internal tools on your data

Your team needs screens on top of its data: a back office, a dashboard, a list to process.

- [Tables](../build/data/tables.md) declared in TypeScript, with [access rules per
  role](../build/data/access-policies.md).
- [Queries](../build/data/queries.md) from processes and from apps.
- [Apps restricted to your staff](../build/apps/access-and-sign-in.md), or to some roles.
- [Push notifications](../build/apps/push-notifications.md) in your team's browsers, even
  when the app is closed.

## Next steps

- [How Codenotch works](how-it-works.md): the concepts behind these features.
- [Quickstart](../get-started/quickstart.md): your first project in a few minutes.
