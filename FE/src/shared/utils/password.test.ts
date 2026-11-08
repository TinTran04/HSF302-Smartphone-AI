import { describe, expect, it } from 'vitest';
import { getPasswordStrength } from './password';

describe('registration password strength', () => {
  it.each([
    ['', null],
    ['Ab1!xyz', 'weak'],
    ['12345678', 'weak'],
    ['abcdefgh', 'weak'],
    ['Abcd1234', 'medium'],
    ['abcdefgh1234', 'medium'],
    ['mậtkhẩuđủdài', 'weak'],
    ['MậtkhẩuTiếngViệt', 'medium'],
    ['Mậtkhẩu2026!', 'strong'],
    ['LongTest123!', 'strong'],
  ] as const)('rates a password by its length and character variety', (password, expected) => {
    expect(getPasswordStrength(password)).toBe(expected);
  });
});
