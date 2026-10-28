import { expect, test as base } from '@playwright/test';

// What the specs share. The shelf is an internal app: the runtime sends a visitor without a session
// to sign in, and a development host signs people in with its dev login, where 'Log as Internal'
// is admin@example.com, the internal user of the host. The page of every test starts signed in as
// that user, on the shelf.

export const test = base.extend({
    page: async ({ page }, use) => {
        await page.goto('shelf/');
        await page.locator('#login-internal').click();
        await expect(page.getByRole('heading', { name: 'Team Library' })).toBeVisible();
        await use(page);
    },
});

export { expect };
