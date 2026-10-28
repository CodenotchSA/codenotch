import { expect, test } from './fixtures';

// The shelf as a member of the team reads it. The starter books are the ones SeedLibrary put on the
// shelf when the project was first installed; the shelf may hold more, the books added since.

/** In title order */
const STARTER_TITLES = [
    'Designing Data-Intensive Applications',
    'Domain-Driven Design',
    'Refactoring',
    'The Mythical Man-Month',
    'The Pragmatic Programmer',
];

test('the shelf lists its books in title order', async ({ page }) => {
    // The first cell of a row is the title: the starter books are among them, in this order
    await expect(page.locator('tbody tr td:first-child')).toContainText(STARTER_TITLES);
});

test('the search keeps the books whose title or author contains the text', async ({ page }) => {
    const titles = page.locator('tbody tr td:first-child');
    const search = page.getByPlaceholder('Search a title or an author');
    // The whole shelf first: its load must not answer after the search and show it all again
    await expect(titles.first()).toBeVisible();

    await search.fill('Kleppmann');
    await expect(titles).toHaveText(['Designing Data-Intensive Applications']);

    await search.fill('Month');
    await expect(titles).toHaveText(['The Mythical Man-Month']);

    await search.fill('Knuth');
    await expect(page.getByText('No book matches.')).toBeVisible();
});
