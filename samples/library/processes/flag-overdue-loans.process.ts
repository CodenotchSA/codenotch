import { process, timer } from '@codenotch/process';
import { Loans } from '../tables/loans.table';

export const flagOverdueLoans = process({
    id: 'FlagOverdueLoans',
    description: 'Every morning, flags the loans whose book is still out after its due date.',
    auth: { scope: 'system' },
    trigger: timer('0 7 * * *', { timeZone: 'Europe/Zurich' }),
    run: async (ctx): Promise<{ today: string; flagged: number }> => {
        // A loan due on a day may be kept until its end: it is overdue from the next one. At 07:00
        // in Zurich, the UTC date is already Zurich's
        const today = ctx.now().toISOString().slice(0, 10);
        const { affected } = await ctx.data.query(Loans)
            .filter(loan => loan.ReturnedAt.IsNull().and(loan.Overdue.Equal(false)).and(loan.DueOn.Before(today)))
            .update({ Overdue: true }, { maxAffected: '*' })
            .run();
        return { today, flagged: affected ?? 0 };
    },
});
