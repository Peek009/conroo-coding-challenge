import { describe, expect, it } from 'vitest';

import { createSseLineParser } from '../sseLineParser.js';

describe('createSseLineParser', () => {
  it('extracts a single data payload from one full chunk', () => {
    const received: string[] = [];
    const feed = createSseLineParser((data) => received.push(data));

    feed('data: {"id":1}\n\n');

    expect(received).toEqual(['{"id":1}']);
  });

  it('buffers a payload split across multiple chunks', () => {
    const received: string[] = [];
    const feed = createSseLineParser((data) => received.push(data));

    feed('data: {"id":1,"cur');
    expect(received).toEqual([]);
    feed('rentCapacity":30}\n\n');

    expect(received).toEqual(['{"id":1,"currentCapacity":30}']);
  });

  it('extracts multiple events delivered in one chunk', () => {
    const received: string[] = [];
    const feed = createSseLineParser((data) => received.push(data));

    feed('data: {"id":1}\n\ndata: {"id":2}\n\n');

    expect(received).toEqual(['{"id":1}', '{"id":2}']);
  });

  it('ignores non-data lines (comments, event, id)', () => {
    const received: string[] = [];
    const feed = createSseLineParser((data) => received.push(data));

    feed(': ping\nevent: update\nid: 42\ndata: {"id":1}\n\n');

    expect(received).toEqual(['{"id":1}']);
  });

  it('handles CRLF line endings', () => {
    const received: string[] = [];
    const feed = createSseLineParser((data) => received.push(data));

    feed('data: {"id":1}\r\n\r\n');

    expect(received).toEqual(['{"id":1}']);
  });

  it('parses the real upstream payload (empty id field, multiple events)', () => {
    const received: string[] = [];
    const feed = createSseLineParser((data) => received.push(data));

    feed(
      [
        'id: ',
        'data: {"id":47,"currentCapacity":46,"category":"red"}',
        '',
        'id: ',
        'data: {"id":3,"currentCapacity":47,"category":"red"}',
        '',
        'id: ',
        'data: {"id":26,"currentCapacity":44,"category":"red"}',
        '',
        'id: ',
        'data: {"id":34,"currentCapacity":3,"category":"green"}',
        '',
        'id: ',
        'data: {"id":6,"currentCapacity":33,"category":"red"}',
        '',
        '',
      ].join('\n'),
    );

    expect(received.map((data) => JSON.parse(data))).toEqual([
      { id: 47, currentCapacity: 46, category: 'red' },
      { id: 3, currentCapacity: 47, category: 'red' },
      { id: 26, currentCapacity: 44, category: 'red' },
      { id: 34, currentCapacity: 3, category: 'green' },
      { id: 6, currentCapacity: 33, category: 'red' },
    ]);
  });
});
