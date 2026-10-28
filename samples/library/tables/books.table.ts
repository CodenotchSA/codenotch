import { defineEntity, p, type InferEntity } from '@codenotch/orm';
import { Loans } from './loans.table';

/** The shelf: one row per physical book, so two copies of a title are two rows. */
export const Books = defineEntity({
    name: 'Books',
    // The team reads the shelf from the app; only the processes write it
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
        /** When the book was put on the shelf */
        CreatedAt: p.createdAt(),
        Title: p.string(),
        Author: p.string(),
        /** The ISBN-13, digits only; null when the book has none */
        Isbn: p.string().nullable(),
        /** On the shelf, not on loan: BorrowBook takes it off, ReturnBook puts it back */
        Available: p.boolean().default(true),
        // A book with loans cannot be deleted: its loans are the library's history
        Loans: () => p.hasMany(Loans, { belongsTo: 'Book' }),
    },
});

export type IBook = InferEntity<typeof Books>;
