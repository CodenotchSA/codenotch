import { api, mcp, process } from '@codenotch/process';
import { Books } from '../tables/books.table';

interface FindBooksInput {
    /** A part of the title or of the author's name; every book when absent */
    q?: string;
}

type FoundBook = { id: string; title: string; author: string; isbn: string | null; available: boolean };

// GET /library/api/books?q=… and find_books, the same search as a tool of the project's MCP server
export const findBooks = process({
    id: 'FindBooks',
    kind: 'ephemeral',
    description: 'The books whose title or author contains a text, in title order.',
    auth: { scope: 'internal' },
    trigger: [
        api.get('/books'),
        mcp.tool('find_books', {
            description: 'Searches the team library: the books whose title or author contains the text q (every book '
                + 'when q is absent), in title order, at most 100, each with its id and whether it is on the shelf '
                + '(available) or on loan.',
            effect: 'read',
        }),
    ],
    run: async (ctx, input: FindBooksInput): Promise<{ books: FoundBook[] }> => {
        const text = typeof input?.q === 'string' ? input.q.trim() : '';
        const shelf = ctx.table(Books);
        const matching = text === '' ? shelf : shelf.filter(book => book.Title.Like(text).or(book.Author.Like(text)));
        const books = await matching
            .select(book => ({ id: book.Id, title: book.Title, author: book.Author, isbn: book.Isbn, available: book.Available }))
            .orderBy('title', 'ASC')
            .limit(100)
            .run();
        return { books };
    },
});
