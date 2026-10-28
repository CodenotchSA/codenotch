// The people and the books the tests share. The database is not reset between tests: each test
// seeds what it reads, with stockShelf or on its own.
import type { TestEnv } from '@codenotch/process/testing';
import type { ILoan } from '../tables/loans.table';

export const ADA = { id: 'a0000000-0000-4000-8000-00000000000a', name: 'Ada Lovelace', email: 'ada@example.com', group: 'internal' as const, roles: [] };
export const GRACE = { id: 'a0000000-0000-4000-8000-00000000000b', name: 'Grace Hopper', email: 'grace@example.com', group: 'internal' as const, roles: [] };
export const LIBRARIAN = { id: 'a0000000-0000-4000-8000-00000000000c', name: 'Margaret Hamilton', email: 'margaret@example.com', group: 'internal' as const, roles: ['Admin'] };

export const REFACTORING = '0b000000-0000-4000-8000-000000000101';
export const DDIA = '0b000000-0000-4000-8000-000000000102';
export const MYTHICAL = '0b000000-0000-4000-8000-000000000103';

/** Three books on the shelf, no loan. */
export const stockShelf = async (env: TestEnv): Promise<void> => {
    // The loans first: they point at the books
    await env.table('Loans').seed([]);
    await env.table('Books').seed([
        { Id: REFACTORING, Title: 'Refactoring', Author: 'Martin Fowler', Isbn: '9780134757599', Available: true },
        { Id: DDIA, Title: 'Designing Data-Intensive Applications', Author: 'Martin Kleppmann', Isbn: '9781449373320', Available: true },
        { Id: MYTHICAL, Title: 'The Mythical Man-Month', Author: 'Frederick P. Brooks Jr.', Isbn: null, Available: true },
    ]);
};

/** A loan as it is stored while the book is out; `changes` overrides any column. */
export const openLoan = (id: string, bookId: string, borrower: { id: string; name: string }, dueOn: string, changes: Partial<ILoan> = {}): Partial<ILoan> & { Id: string } => ({
    Id: id,
    BookId: bookId,
    BorrowerId: borrower.id,
    BorrowerName: borrower.name,
    BorrowedAt: '2026-03-01T09:00:00Z',
    DueOn: dueOn,
    ReturnedAt: null,
    Overdue: false,
    ...changes,
});

/** Puts the loans in the table and takes their books off the shelf, as BorrowBook does. */
export const lend = async (env: TestEnv, ...loans: (Partial<ILoan> & { Id: string })[]): Promise<void> => {
    await env.table('Loans').seed(loans);
    for (const loan of loans)
        if (loan.ReturnedAt === null)
            await env.table('Books').write(loan.BookId!, { Available: false });
};
