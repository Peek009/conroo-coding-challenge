import { afterEach, describe, expect, it, vi } from 'vitest';

import { subscribeToTimeSlotUpdates } from '../timeSlotsSse.js';

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  close(): void {
    this.closed = true;
  }

  emit(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }
}

function getInstance(): MockEventSource {
  const instance = MockEventSource.instances[0];
  if (!instance) throw new Error('no EventSource instance was created');
  return instance;
}

describe('subscribeToTimeSlotUpdates', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    MockEventSource.instances = [];
  });

  it('connects to /sse', () => {
    vi.stubGlobal('EventSource', MockEventSource);

    subscribeToTimeSlotUpdates({ onUpdate: () => {} });

    expect(MockEventSource.instances).toHaveLength(1);
    expect(getInstance().url).toBe('/sse');
  });

  it('forwards parsed updates to onUpdate', () => {
    vi.stubGlobal('EventSource', MockEventSource);
    const updates: unknown[] = [];

    subscribeToTimeSlotUpdates({ onUpdate: (update) => updates.push(update) });
    getInstance().emit({ id: 1, currentCapacity: 30, category: 'yellow' });

    expect(updates).toEqual([{ id: 1, currentCapacity: 30, category: 'yellow' }]);
  });

  it('drops malformed updates without throwing', () => {
    vi.stubGlobal('EventSource', MockEventSource);
    const updates: unknown[] = [];

    subscribeToTimeSlotUpdates({ onUpdate: (update) => updates.push(update) });

    expect(() => getInstance().emit({ id: 1, category: 'yellow' })).not.toThrow();
    expect(updates).toEqual([]);
  });

  it('calls onOpen when the connection opens', () => {
    vi.stubGlobal('EventSource', MockEventSource);
    const onOpen = vi.fn();

    subscribeToTimeSlotUpdates({ onUpdate: () => {}, onOpen });
    getInstance().onopen?.();

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('calls onError when the connection errors', () => {
    vi.stubGlobal('EventSource', MockEventSource);
    const onError = vi.fn();

    subscribeToTimeSlotUpdates({ onUpdate: () => {}, onError });
    getInstance().onerror?.();

    expect(onError).toHaveBeenCalledOnce();
  });

  it('closes the connection on unsubscribe', () => {
    vi.stubGlobal('EventSource', MockEventSource);

    const unsubscribe = subscribeToTimeSlotUpdates({ onUpdate: () => {} });
    unsubscribe();

    expect(getInstance().closed).toBe(true);
  });
});
