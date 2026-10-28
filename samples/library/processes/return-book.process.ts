import { api, is, process, ProcessError } from '@codenotch/process';
import { Books } from '../tables/books.table';
import { Loans } from '../tables/loans.table';

interface ReturnBookInput {
    /** The id of the loan, from the url */
    loanId: string;
}

type BookReturned = { loanId: string; bookId: string; returnedAt: string; late: boolean };

export const returnBook = process({
    id: 'ReturnBook',
    description: 'Puts a borrowed book back on the shelf. The borrower returns it, or a librarian for them.',
    auth: { scope: 'internal' },
    trigger: api.post('/loans/{loanId}/return'),
    run: async (ctx, input: ReturnBookInput): Promise<BookReturned> => {
        const loanId = input?.loanId ?? '';
        const loan = is.uuid(loanId) ? await ctx.table(Loans).read(loanId) : null;
        if (loan === null)
            throw new ProcessError('loan.unknown', { status: 404, message: `no loan has the id '${loanId}'` });
        if (loan.ReturnedAt !== null)
            throw new ProcessError('loan.returned', { status: 409, message: 'this book is already back on the shelf' });
        if (loan.BorrowerId !== ctx.user.id && !ctx.user.roles.includes('Admin'))
            throw new ProcessError('loan.notYours', { status: 403, message: 'only the borrower or a librarian returns a book' });

        const returnedAt = ctx.now().toISOString();
        // The loan closes and the book is back on the shelf in one transaction
        await ctx.data.exec([
            ctx.data.write(Loans).update(loanId, { ReturnedAt: returnedAt }),
            ctx.data.write(Books).update(loan.BookId, { Available: true }),
        ]).run();
        return { loanId, bookId: loan.BookId, returnedAt, late: returnedAt.slice(0, 10) > loan.DueOn.slice(0, 10) };
    },
});
