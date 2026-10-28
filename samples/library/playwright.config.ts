import { defineConfig, devices } from '@playwright/test';

// The end-to-end tests of the app: the '*.spec.ts' files of playwright/, run in a real browser
// against the project deployed on a runtime, never against a dev server. CODENOTCH_PROJECT_URL is
// the address the project is served under, such as 'http://localhost:5105/library/': a spec opens
// the app with page.goto('shelf/'). Deploy with 'cn project start', then set it. The browser comes
// from 'npx playwright install chromium'.

const baseURL = process.env.CODENOTCH_PROJECT_URL;
if (!baseURL) {
    throw new Error("CODENOTCH_PROJECT_URL is not set: deploy the project ('cn project start'), then set it to its address, such as 'http://localhost:5105/library/'");
}

export default defineConfig({
    testDir: './playwright',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    // What a run leaves behind goes under generated/, ignored by git: the traces, the screenshots
    // and the html report ('npx playwright show-report generated/playwright-report')
    outputDir: './generated/test-results',
    reporter: [['list'], ['html', { open: 'never', outputFolder: './generated/playwright-report' }]],
    use: {
        baseURL: baseURL.endsWith('/') ? baseURL : `${baseURL}/`,
        trace: 'on-first-retry'
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
    ]
});
