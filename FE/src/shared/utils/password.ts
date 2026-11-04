export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | null {
  if (!password) return null;
  if (password.length < 8) return 'weak';

  const characterTypes = [/[\p{Ll}\p{Lo}]/u, /\p{Lu}/u, /\p{N}/u, /[^\p{L}\p{N}\s]/u]
    .filter((pattern) => pattern.test(password)).length;

  if (password.length >= 12 && characterTypes >= 3) return 'strong';
  return characterTypes >= 2 ? 'medium' : 'weak';
}
