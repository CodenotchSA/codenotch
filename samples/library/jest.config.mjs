// The unit tests: the '*.spec.ts' files next to the code they test, run on Node as plain functions.
// Never the '*.test.ts' ones, which are the process tests 'cn project test' runs on the runtime,
// nor the Playwright specs of playwright/, which drive the deployed app in a browser.
//
// Jest runs in ESM mode, the module system of the sources: ts-jest keeps the imports, and the
// 'test:unit' script starts Node with --experimental-vm-modules. ts-jest reads tsconfig.json; its
// 'isolatedModules' makes it transpile each file alone, without typechecking: 'cn project compile'
// typechecks every script of the project anyway.

/** @type {import('jest').Config} */
export default {
    testEnvironment: 'node',
    testMatch: ['<rootDir>/**/*.spec.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/playwright/', '/.codenotch/'],
    // 'jest --coverage' writes under generated/, like everything derived (ignored by git)
    coverageDirectory: '<rootDir>/generated/coverage',
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { useESM: true }]
    }
};
