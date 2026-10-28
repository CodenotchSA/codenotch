import { defineEntity, p, type InferEntity } from '@codenotch/orm';
import { Books } from './books.table';

/** One row per loan: who took which book, when it is due back, and when it came back. */
export const Loans = defineEntity({
    name: 'Loans',
    // The whole team sees who has which book
    accessPolicy: {
        internal: {
            admin: { read: 'all', create: 'all', update: 'all', delete: 'all' },
            _other: { read: 'all', create: 'none', update: 'none', delete: 'none' },
        },
        external: { read: 'none', create: 'none', update: 'none', delete: 'none' },
        public: { read: 'none', create: 'none', update: 'none', delete: 'none' },
        system: {},
    },
    properties: {
        Id: p.uuid().primary(),
        Book: () => p.belongsTo(Books, { key: 'BookId' }),
        /** The borrower's user id, as ctx.user.id gives it */
        BorrowerId: p.string(),
        /** The borrower's name, for the shelf to show who has the book */
        BorrowerName: p.string(),
        BorrowedAt: p.datetime(),
        /** The last day the book may be kept */
        DueOn: p.date(),
        /** Null while the book is out */
        ReturnedAt: p.datetime().nullable(),
        /** Set by FlagOverdueLoans each morning once DueOn has passed; kept after the return */
        Overdue: p.boolean().default(false),
    },
});

export type ILoan = InferEntity<typeof Loans>;
