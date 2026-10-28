import { describe, expect, it } from '@jest/globals';
import { isbn13 } from './isbn';

// A unit test of a plain function: Jest alone on Node ('npm run test:unit'), no runtime. AddBook
// checks the ISBN of a new book with it; tests/add-book.test.ts checks the process on the runtime.

describe('isbn13', () => {

    it('keeps the 13 digits of a valid ISBN, without its dashes and spaces', () => {
        expect(isbn13('978-1-942788-33-1')).toBe('9781942788331');
        expect(isbn13('978 0 13 595705 9')).toBe('9780135957059');
        expect(isbn13('9780134757599')).toBe('9780134757599');
    });

    it('takes a check digit of 0, when the weighted sum is a multiple of 10', () => {
        expect(isbn13('978-1-4493-7332-0')).toBe('9781449373320');
    });

    it('refuses a wrong check digit', () => {
        expect(isbn13('978-1-942788-33-2')).toBeNull();
    });

    it('refuses anything but 13 digits', () => {
        expect(isbn13('')).toBeNull();
        expect(isbn13('0-306-40615-2')).toBeNull(); // an ISBN-10
        expect(isbn13('97819427883310')).toBeNull();
        expect(isbn13('978-1-942788-33-X')).toBeNull();
    });
});
