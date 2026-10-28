/** The ISBN-13 without its dashes and spaces, when its check digit is right; null otherwise. */
export const isbn13 = (value: string): string | null => {
    const digits = value.replace(/[-\s]/g, '');
    if (!/^\d{13}$/.test(digits))
        return null;
    const sum = [...digits.slice(0, 12)].reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);
    return (10 - sum % 10) % 10 === Number(digits[12]) ? digits : null;
};
