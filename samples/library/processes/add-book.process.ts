import { api, process, ProcessError } from '@codenotch/process';
import { isbn13 } from '../lib/isbn';
import { Books } from '../tables/books.table';

interface AddBookInput {
    /** 1 to 200 characters */
    title: string;
    /** 1 to 200 characters */
    author: string;
    /** An ISBN-13, dashes and spaces allowed; optional */
    isbn?: string;
}

type BookAdded = { id: string; title: string; author: string; isbn: string | null };

const textError = (field: string, value: unknown): string | null =>
    typeof value !== 'string' || value.trim().length === 0 || value.trim().length > 200
        ? `${field} takes 1 to 200 characters`
        : null;

export const addBook = process({
    id: 'AddBook',
    description: 'Puts a new book on the shelf.',
    auth: { scope: 'internal', roles: ['Admin'] },
    trigger: api.post('/books'),
    run: async (ctx, input: AddBookInput): Promise<BookAdded> => {
        const hasIsbn = typeof input?.isbn === 'string' && input.isbn.trim() !== '';
        const isbn = hasIsbn ? isbn13(input.isbn!) : null;
        const errors = [
            textError('title', input?.title),
            textError('author', input?.author),
            hasIsbn && isbn === null ? 'isbn takes an ISBN-13 with a valid check digit' : null,
        ].filter((error): error is string => error !== null);
        if (errors.length > 0)
            throw new ProcessError('book.invalid', { status: 400, message: errors.join('; '), details: { errors } });

        const book = { id: ctx.uuid(), title: input.title.trim(), author: input.author.trim(), isbn };
        await ctx.data.write(Books).insert({ Id: book.id, Title: book.title, Author: book.author, Isbn: book.isbn, Available: true }).run();
        return book;
    },
});
