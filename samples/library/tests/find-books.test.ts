import { beforeEach, expect, test } from '@codenotch/process/testing';
import { ADA, DDIA, GRACE, lend, openLoan, stockShelf } from './fixtures';

type Found = { books: { id: string; title: string; author: string; isbn: string | null; available: boolean }[] };

beforeEach(stockShelf);

test('FindBooks matches a part of the title or of the author, in title order', async (env) => {
    const byAuthor = await env.start<Found>('FindBooks', { input: { q: 'Martin' }, user: ADA });
    expect((await byAuthor.output()).books.map(book => book.title)).toEqual(['Designing Data-Intensive Applications', 'Refactoring']);

    const byTitle = await env.start<Found>('FindBooks', { input: { q: 'Month' }, user: ADA });
    expect((await byTitle.output()).books).toEqual([
        { id: '0b000000-0000-4000-8000-000000000103', title: 'The Mythical Man-Month', author: 'Frederick P. Brooks Jr.', isbn: null, available: true },
    ]);

    const none = await env.start<Found>('FindBooks', { input: { q: 'Knuth' }, user: ADA });
    expect((await none.output()).books).toHaveLength(0);
});

test('without a text FindBooks lists the whole shelf, and tells what is on loan', async (env) => {
    await lend(env, openLoan('10000000-0000-4000-8000-000000000001', DDIA, GRACE, '2026-03-22'));

    const run = await env.start<Found>('FindBooks', { user: ADA });

    const { books } = await run.output();
    expect(books.map(book => book.title)).toEqual(['Designing Data-Intensive Applications', 'Refactoring', 'The Mythical Man-Month']);
    expect(books.map(book => book.available)).toEqual([false, true, true]);
});
