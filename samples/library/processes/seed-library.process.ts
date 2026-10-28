import { install, process } from '@codenotch/process';
import { Books } from '../tables/books.table';

// The books the shelf opens with. Fixed ids: a second run writes the same rows
const STARTER_BOOKS = [
    { id: '0b000000-0000-4000-8000-000000000001', title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', isbn: '9780135957059' },
    { id: '0b000000-0000-4000-8000-000000000002', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781449373320' },
    { id: '0b000000-0000-4000-8000-000000000003', title: 'Refactoring', author: 'Martin Fowler', isbn: '9780134757599' },
    { id: '0b000000-0000-4000-8000-000000000004', title: 'Domain-Driven Design', author: 'Eric Evans', isbn: '9780321125217' },
    { id: '0b000000-0000-4000-8000-000000000005', title: 'The Mythical Man-Month', author: 'Frederick P. Brooks Jr.', isbn: '9780201835953' },
];

export const seedLibrary = process({
    id: 'SeedLibrary',
    description: 'Puts the starter books on the shelf, on the first install.',
    auth: { scope: 'system' },
    trigger: install({ once: true }),
    run: async (ctx): Promise<{ books: number }> => {
        // One transaction for the whole shelf. Available is left out: a new row takes its default,
        // and a book already on loan stays on loan
        await ctx.data.exec(STARTER_BOOKS.map(book =>
            ctx.data.write(Books).upsert(book.id, { Title: book.title, Author: book.author, Isbn: book.isbn }))).run();
        return { books: STARTER_BOOKS.length };
    },
});
