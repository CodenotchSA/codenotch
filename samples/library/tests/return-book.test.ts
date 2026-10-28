import { beforeEach, expect, test } from '@codenotch/process/testing';
import { ADA, DDIA, GRACE, lend, LIBRARIAN, openLoan, REFACTORING, stockShelf } from './fixtures';

type Returned = { loanId: string; bookId: string; returnedAt: string; late: boolean };

const ADA_LOAN = '10000000-0000-4000-8000-000000000001';

beforeEach(async (env) => {
    await stockShelf(env);
    await lend(env, openLoan(ADA_LOAN, DDIA, ADA, '2026-03-22'));
});

test('the borrower returns the book: the loan closes and the book is back on the shelf', { now: '2026-03-20T16:00:00Z' }, async (env) => {
    const run = await env.start<Returned>('ReturnBook', { input: { loanId: ADA_LOAN }, user: ADA });

    expect(await run.output()).toEqual({ loanId: ADA_LOAN, bookId: DDIA, returnedAt: '2026-03-20T16:00:00.000Z', late: false });
    expect(await env.table('Loans').get(ADA_LOAN)).not.toContain({ ReturnedAt: null });
    expect(await env.table('Books').get(DDIA)).toContain({ Available: true });
});

test('a book back after its due date is late', { now: '2026-03-23T08:00:00Z' }, async (env) => {
    const run = await env.start<Returned>('ReturnBook', { input: { loanId: ADA_LOAN }, user: ADA });

    expect(await run.output()).toContain({ late: true });
});

test('someone else\'s book is returned by a librarian only', async (env) => {
    const refused = await env.start('ReturnBook', { input: { loanId: ADA_LOAN }, user: GRACE });
    expect(await refused.failure()).toContain({ code: 'loan.notYours', status: 403 });
    expect(await env.table('Books').get(DDIA)).toContain({ Available: false });

    const librarian = await env.start('ReturnBook', { input: { loanId: ADA_LOAN }, user: LIBRARIAN });
    expect(await librarian.state()).toBe('SUCCESS');
    expect(await env.table('Books').get(DDIA)).toContain({ Available: true });
});

test('a loan is returned once, and an unknown loan is a 404', async (env) => {
    await env.start('ReturnBook', { input: { loanId: ADA_LOAN }, user: ADA });

    const twice = await env.start('ReturnBook', { input: { loanId: ADA_LOAN }, user: ADA });
    expect(await twice.failure()).toContain({ code: 'loan.returned', status: 409 });

    const unknown = await env.start('ReturnBook', { input: { loanId: '10000000-0000-4000-8000-0000000009ff' }, user: ADA });
    expect(await unknown.failure()).toContain({ code: 'loan.unknown', status: 404 });
    expect(await env.table('Books').get(REFACTORING)).toContain({ Available: true });
});
