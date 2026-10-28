import { beforeEach, expect, test } from '@codenotch/process/testing';
import { ADA, DDIA, GRACE, lend, MYTHICAL, openLoan, REFACTORING, stockShelf } from './fixtures';

type Borrowed = { loanId: string; bookId: string; title: string; dueOn: string };

beforeEach(stockShelf);

test('a member borrows a book: off the shelf, due back three weeks later', { now: '2026-03-02T09:30:00Z' }, async (env) => {
    const run = await env.start<Borrowed>('BorrowBook', { input: { bookId: REFACTORING }, user: ADA });

    expect(await run.state()).toBe('SUCCESS');
    const borrowed = await run.output();
    expect(borrowed).toContain({ bookId: REFACTORING, title: 'Refactoring', dueOn: '2026-03-23' });
    expect(await env.table('Books').get(REFACTORING)).toContain({ Available: false });
    expect(await env.table('Loans').get(borrowed.loanId)).toContain({
        BookId: REFACTORING, BorrowerId: ADA.id, BorrowerName: 'Ada Lovelace', ReturnedAt: null, Overdue: false,
    });
});

test('the loan lasts the loanDays of the deployment', { now: '2026-03-02T09:30:00Z' }, async (env) => {
    const run = await env.start<Borrowed>('BorrowBook', { input: { bookId: DDIA }, user: ADA, params: { loanDays: 7 } });

    expect((await run.output()).dueOn).toBe('2026-03-09');
});

test('a book on loan cannot be borrowed again', async (env) => {
    await env.start('BorrowBook', { input: { bookId: REFACTORING }, user: GRACE });

    const run = await env.start('BorrowBook', { input: { bookId: REFACTORING }, user: ADA });

    expect(await run.failure()).toContain({ code: 'book.onLoan', status: 409 });
    expect(await env.table('Loans').rows()).toHaveLength(1);
});

test('an unknown book is a 404', async (env) => {
    const unknown = await env.start('BorrowBook', { input: { bookId: '0b000000-0000-4000-8000-0000000009ff' }, user: ADA });
    expect(await unknown.failure()).toContain({ code: 'book.unknown', status: 404 });

    const malformed = await env.start('BorrowBook', { input: { bookId: 'not-an-id' }, user: ADA });
    expect(await malformed.failure()).toContain({ code: 'book.unknown', status: 404 });
});

test('a member with an overdue book borrows nothing more until it is back', async (env) => {
    await lend(env, openLoan('10000000-0000-4000-8000-000000000001', DDIA, ADA, '2026-02-01', { Overdue: true }));

    const refused = await env.start('BorrowBook', { input: { bookId: MYTHICAL }, user: ADA });
    expect(await refused.failure()).toContain({ code: 'loan.overdue', status: 409 });
    expect(await env.table('Books').get(MYTHICAL)).toContain({ Available: true });

    // Somebody else still borrows it
    const other = await env.start('BorrowBook', { input: { bookId: MYTHICAL }, user: GRACE });
    expect(await other.state()).toBe('SUCCESS');
});
