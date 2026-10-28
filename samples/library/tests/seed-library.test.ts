import { beforeEach, expect, test } from '@codenotch/process/testing';

beforeEach(async (env) => {
    await env.table('Loans').seed([]);
    await env.table('Books').seed([]);
});

test('SeedLibrary puts the five starter books on the shelf', async (env) => {
    // An install trigger is started like any process: a test does not redeploy the project
    const run = await env.start<{ books: number }>('SeedLibrary');

    expect(await run.output()).toEqual({ books: 5 });
    const books = await env.table('Books').rows();
    expect(books.map(book => book.Title).sort()).toEqual([
        'Designing Data-Intensive Applications', 'Domain-Driven Design', 'Refactoring', 'The Mythical Man-Month', 'The Pragmatic Programmer',
    ]);
    expect(await env.table('Books').get('0b000000-0000-4000-8000-000000000002')).toContain({
        Title: 'Designing Data-Intensive Applications', Author: 'Martin Kleppmann', Isbn: '9781449373320', Available: true,
    });
});

test('SeedLibrary run twice adds nothing, and leaves a book on loan on loan', async (env) => {
    await env.start('SeedLibrary');
    await env.table('Books').write('0b000000-0000-4000-8000-000000000003', { Available: false });

    await env.start('SeedLibrary');

    const books = await env.table('Books').rows();
    expect(books).toHaveLength(5);
    expect(await env.table('Books').get('0b000000-0000-4000-8000-000000000003')).toContain({ Title: 'Refactoring', Available: false });
});
