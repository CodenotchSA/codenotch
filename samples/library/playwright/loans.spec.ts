import { expect, test } from './fixtures';

// A loan from the shelf and back: the buttons start BorrowBook and ReturnBook, and the page shows
// what they changed.

test('a member borrows a book, finds it among their loans, and returns it', async ({ page }) => {
    const book = page.locator('tbody tr').filter({ hasText: 'The Pragmatic Programmer' });
    const loan = page.locator('ul.loans li').filter({ hasText: 'The Pragmatic Programmer' });
    const notice = page.locator('.notice');

    await book.getByRole('button', { name: 'Borrow' }).click();
    await expect(notice).toContainText("'The Pragmatic Programmer' is yours until");
    await expect(loan).toBeVisible();
    await expect(book).not.toContainText('on the shelf');

    await loan.getByRole('button', { name: 'Return' }).click();
    await expect(notice).toHaveText('Returned. Thank you!');
    await expect(loan).toHaveCount(0);
    await expect(book).toContainText('on the shelf');
});
