import { api, is, process, ProcessError, type CallerIdentity } from '@codenotch/process';
import { Books } from '../tables/books.table';
import { Loans } from '../tables/loans.table';

interface BorrowBookInput {
    /** The id of the book, from the url */
    bookId: string;
}

type BookBorrowed = { loanId: string; bookId: string; title: string; dueOn: string };

const DEFAULT_LOAN_DAYS = 21;

const borrowerName = (user: CallerIdentity): string => user.name ?? user.email ?? user.id;

export const borrowBook = process({
    id: 'BorrowBook',
    description: 'Lends a book of the shelf to the caller, due back loanDays days later.',
    auth: { scope: 'internal' },
    trigger: api.post('/books/{bookId}/borrow'),
    run: async (ctx, input: BorrowBookInput): Promise<BookBorrowed> => {
        const bookId = input?.bookId ?? '';
        const book = is.uuid(bookId) ? await ctx.table(Books).read(bookId) : null;
        if (book === null)
            throw new ProcessError('book.unknown', { status: 404, message: `no book has the id '${bookId}'` });

        // A borrower whose book is overdue takes nothing more until it is back
        const me = ctx.user.id;
        const overdue = await ctx.table(Loans)
            .filter(loan => loan.BorrowerId.Equal(me).and(loan.ReturnedAt.IsNull()).and(loan.Overdue.Equal(true)))
            .select(loan => ({ id: loan.Id }))
            .limit(1)
            .run();
        if (overdue.length > 0)
            throw new ProcessError('loan.overdue', { status: 409, message: 'an overdue book must be returned before borrowing another one' });

        // Taking the book off the shelf is the guard: of two people borrowing it at once, only one
        // update finds it available
        const { affected } = await ctx.data.query(Books)
            .filter(shelf => shelf.Id.Equal(bookId).and(shelf.Available.Equal(true)))
            .update({ Available: false }, { maxAffected: 1 })
            .run();
        if (affected !== 1)
            throw new ProcessError('book.onLoan', { status: 409, message: `'${book.Title}' is already on loan` });

        const days = Number(ctx.params.loanDays);
        const now = ctx.now();
        const loan = {
            loanId: ctx.uuid(),
            bookId,
            title: book.Title,
            dueOn: now.plus({ days: Number.isInteger(days) && days > 0 ? days : DEFAULT_LOAN_DAYS }).toISOString().slice(0, 10),
        };
        // Should this write fail, the run fails and the update above is rolled back: the book is not lost
        await ctx.data.write(Loans).insert({
            Id: loan.loanId,
            BookId: bookId,
            BorrowerId: me,
            BorrowerName: borrowerName(ctx.user),
            BorrowedAt: now.toISOString(),
            DueOn: loan.dueOn,
            ReturnedAt: null,
            Overdue: false,
        }).run();
        return loan;
    },
});
