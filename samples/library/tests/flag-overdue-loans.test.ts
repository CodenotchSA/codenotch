import { beforeEach, expect, test } from '@codenotch/process/testing';
import { ADA, DDIA, GRACE, lend, MYTHICAL, openLoan, REFACTORING, stockShelf } from './fixtures';

const LATE = '10000000-0000-4000-8000-000000000001';
const DUE_TODAY = '10000000-0000-4000-8000-000000000002';
const RETURNED_LATE = '10000000-0000-4000-8000-000000000003';

beforeEach(async (env) => {
    await stockShelf(env);
    await lend(env,
        openLoan(LATE, DDIA, ADA, '2026-03-09'),
        openLoan(DUE_TODAY, REFACTORING, GRACE, '2026-03-10'),
        openLoan(RETURNED_LATE, MYTHICAL, GRACE, '2026-03-01', { ReturnedAt: '2026-03-05T10:00:00Z' }));
});

// 07:00 in Zurich is 06:00 UTC in winter
test('at 07:00 in Zurich, the loans still out after their due date are flagged', { now: '2026-03-10T05:30:00Z' }, async (env) => {
    await env.advance('PT20M');
    expect(await env.runs('FlagOverdueLoans')).toHaveLength(0);

    await env.advance('PT20M');
    const runs = await env.runs('FlagOverdueLoans');
    expect(runs).toHaveLength(1);
    expect(await runs[0].output()).toEqual({ today: '2026-03-10', flagged: 1 });

    expect(await env.table('Loans').get(LATE)).toContain({ Overdue: true });
    // Due today: kept until tonight. Returned: nothing to flag
    expect(await env.table('Loans').get(DUE_TODAY)).toContain({ Overdue: false });
    expect(await env.table('Loans').get(RETURNED_LATE)).toContain({ Overdue: false });
});

// 07:00 in Zurich is 05:00 UTC in summer
test('the morning follows Zurich\'s clock in summer, and flags each loan once', { now: '2026-04-01T04:30:00Z' }, async (env) => {
    await env.advance('PT1H');
    const runs = await env.runs('FlagOverdueLoans');
    expect(runs).toHaveLength(1);
    expect(await runs[0].output()).toEqual({ today: '2026-04-01', flagged: 2 });

    // The next morning finds nothing new
    await env.advance('P1D');
    const next = await env.runs('FlagOverdueLoans');
    expect(next).toHaveLength(2);
    expect(await next[1].output()).toEqual({ today: '2026-04-02', flagged: 0 });
});

// The same morning as the first test: each test sees the occurrence its own clock crosses
test('a flagged borrower is refused the next loan', { now: '2026-03-10T05:30:00Z' }, async (env) => {
    await env.advance('PT1H');
    expect(await env.table('Loans').get(LATE)).toContain({ Overdue: true });

    // The Mythical Man-Month is back on the shelf
    const refused = await env.start('BorrowBook', { input: { bookId: MYTHICAL }, user: ADA });
    expect(await refused.failure()).toContain({ code: 'loan.overdue' });
});
