import { EventEmitter } from 'node:events'

import type { Response } from 'express'
import { describe, expect, it, vi } from 'vitest'

import { createSseHub } from '../sseHub.js'

function fakeResponse(writeImpl: () => void = () => {}): Response {
  const emitter = new EventEmitter()
  return Object.assign(emitter, { write: vi.fn(writeImpl) }) as unknown as Response
}

describe('createSseHub', () => {
  it('broadcasts to every subscribed client', () => {
    const hub = createSseHub()
    const clientA = fakeResponse()
    const clientB = fakeResponse()

    hub.subscribe(clientA)
    hub.subscribe(clientB)
    hub.broadcast({ id: 1, currentCapacity: 30, category: 'yellow' })

    const expectedPayload = 'data: {"id":1,"currentCapacity":30,"category":"yellow"}\n\n'
    expect(clientA.write).toHaveBeenCalledWith(expectedPayload)
    expect(clientB.write).toHaveBeenCalledWith(expectedPayload)
  })

  it('stops notifying a client once unsubscribed', () => {
    const hub = createSseHub()
    const client = fakeResponse()

    hub.subscribe(client)
    hub.unsubscribe(client)
    hub.broadcast({ id: 1, currentCapacity: 30, category: 'yellow' })

    expect(client.write).not.toHaveBeenCalled()
  })

  it('tracks the number of subscribed clients', () => {
    const hub = createSseHub()
    const client = fakeResponse()

    expect(hub.size).toBe(0)
    hub.subscribe(client)
    expect(hub.size).toBe(1)
    hub.unsubscribe(client)
    expect(hub.size).toBe(0)
  })

  it('removes a client whose write throws and keeps broadcasting to the rest', () => {
    const hub = createSseHub()
    const badClient = fakeResponse(() => {
      throw new Error('write after end')
    })
    const goodClient = fakeResponse()

    hub.subscribe(badClient)
    hub.subscribe(goodClient)
    hub.broadcast({ id: 1, currentCapacity: 30, category: 'yellow' })

    expect(goodClient.write).toHaveBeenCalled()
    expect(hub.size).toBe(1)
  })

  it('unsubscribes a client when its response emits an error', () => {
    const hub = createSseHub()
    const client = fakeResponse()

    hub.subscribe(client)
    ;(client as unknown as EventEmitter).emit('error', new Error('socket hang up'))

    expect(hub.size).toBe(0)
  })
})
