import { beforeEach, expect, test } from '@codenotch/process/testing';
import { ADA, LIBRARIAN, stockShelf } from './fixtures';

type BookAdded = { id: string; title: string; author: string; isbn: string | null };

beforeEach(stockShelf);

test('a librarian puts a book on the shelf, available at once', async (env) => {
    const run = await env.start<BookAdded>('AddBook', {
        input: { title: '  Accelerate ', author: 'Nicole Forsgren', isbn: '978-1-942788-33-1' },
        user: LIBRARIAN,
    });

    expect(await run.state()).toBe('SUCCESS');
    const added = await run.output();
    // Trimmed, and the ISBN kept as its digits
    expect(added).toContain({ title: 'Accelerate', author: 'Nicole Forsgren', isbn: '9781942788331' });
    expect(await env.table('Books').get(added.id)).toContain({ Title: 'Accelerate', Isbn: '9781942788331', Available: true });
    expect(await env.table('Books').rows()).toHaveLength(4);
});

test('the ISBN is optional', async (env) => {
    const run = await env.start<BookAdded>('AddBook', { input: { title: 'Team Topologies', author: 'Matthew Skelton, Manuel Pais' }, user: LIBRARIAN });

    const added = await run.output();
    expect(added.isbn).toBeNull();
    expect(await env.table('Books').get(added.id)).toContain({ Title: 'Team Topologies', Isbn: null });
});

test('a malformed book is refused with every reason, and nothing is written', async (env) => {
    const run = await env.start('AddBook', { input: { title: ' ', author: 'Somebody', isbn: '9781942788332' }, user: LIBRARIAN });

    expect(await run.state()).toBe('ERROR');
    const failure = await run.failure();
    expect(failure).toContain({ code: 'book.invalid', status: 400 });
    expect(failure.message).toContain('title takes 1 to 200 characters');
    expect(failure.message).toContain('isbn takes an ISBN-13 with a valid check digit');
    expect(await env.table('Books').rows()).toHaveLength(3);
});

test('only a librarian adds a book', async (env) => {
    await expect(env.start('AddBook', { input: { title: 'Peopleware', author: 'Tom DeMarco' }, user: ADA })).rejects.toThrow(/does not satisfy scope/);
    expect(await env.table('Books').rows()).toHaveLength(3);
});
