import { describe, expect, test } from 'bun:test';
import {
  bookingMessage,
  italianDate,
  mailtoUrl,
  whatsappShareUrl,
  whatsappUrl,
  youtubeEmbedUrl,
  youtubeId,
} from './contact';

describe('bookingMessage', () => {
  test('keeps bracketed hints when nothing is filled in', () => {
    expect(bookingMessage()).toBe('Ciao, vorrei informazioni per una data al [nome locale] il [data].');
  });

  test('uses the provided fields', () => {
    expect(
      bookingMessage({ venue: 'Rock Pub', city: 'Modena', date: '30/01/2027', contact: 'Mario, 333 0000000' }),
    ).toBe(
      'Ciao, vorrei informazioni per una data al Rock Pub di Modena il 30/01/2027.\nPotete ricontattarmi qui: Mario, 333 0000000',
    );
  });

  test('trims and collapses whitespace, treats blanks as missing', () => {
    expect(bookingMessage({ venue: '  Rock   Pub ', city: '   ', date: '' })).toBe(
      'Ciao, vorrei informazioni per una data al Rock Pub il [data].',
    );
  });
});

describe('whatsappUrl', () => {
  test('strips formatting from the number and encodes the text', () => {
    expect(whatsappUrl('+39 333 000 0000', 'Ciao & grazie\nA presto')).toBe(
      'https://wa.me/393330000000?text=Ciao%20%26%20grazie%0AA%20presto',
    );
  });

  test('rejects an empty number', () => {
    expect(() => whatsappUrl('', 'ciao')).toThrow();
  });
});

describe('whatsappShareUrl', () => {
  test('has no recipient and encodes text, line breaks and links', () => {
    expect(whatsappShareUrl('Vieni?\nhttps://example.com/date/#x')).toBe(
      'https://wa.me/?text=Vieni%3F%0Ahttps%3A%2F%2Fexample.com%2Fdate%2F%23x',
    );
  });

  test('an empty text still gives a valid link', () => {
    expect(whatsappShareUrl('')).toBe('https://wa.me/?text=');
  });
});

describe('mailtoUrl', () => {
  test('encodes subject and body', () => {
    expect(mailtoUrl('a@example.com', 'Data live?', 'Ciao,\nuna data')).toBe(
      'mailto:a@example.com?subject=Data%20live%3F&body=Ciao%2C%0Auna%20data',
    );
  });
});

describe('italianDate', () => {
  test('converts ISO days and leaves free text alone', () => {
    expect(italianDate('2027-01-30')).toBe('30/01/2027');
    expect(italianDate(' fine gennaio ')).toBe('fine gennaio');
  });
});

describe('youtubeId', () => {
  const id = 'abcDEF12_-x';

  test.each([
    id,
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/watch?v=${id}&t=30s`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=xyz`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/live/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
  ])('extracts the id from %s', (input) => {
    expect(youtubeId(input)).toBe(id);
  });

  test.each([null, undefined, '', '   ', 'non un link', 'https://vimeo.com/123456789', 'https://www.youtube.com/watch?v=corto', 'https://www.youtube.com/@canale'])(
    'returns null for %p',
    (input) => {
      expect(youtubeId(input)).toBeNull();
    },
  );

  test('embed URL uses the no-cookie domain', () => {
    expect(youtubeEmbedUrl(id)).toBe(
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
    );
  });
});
