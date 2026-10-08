import { describe, expect, test } from 'bun:test';
import { fill } from './text';

describe('fill', () => {
  test('replaces every occurrence of the known tokens', () => {
    expect(fill('{name} a {city}, ancora {name}', { name: 'Band', city: 'Modena' })).toBe(
      'Band a Modena, ancora Band',
    );
  });

  test('leaves unknown tokens visible instead of dropping them', () => {
    expect(fill('Ciao {nome}', { name: 'Band' })).toBe('Ciao {nome}');
  });

  test('a template without tokens is returned unchanged', () => {
    expect(fill('Nessun segnaposto', {})).toBe('Nessun segnaposto');
  });

  test('an empty value is a valid replacement', () => {
    expect(fill('a{x}b', { x: '' })).toBe('ab');
  });
});
