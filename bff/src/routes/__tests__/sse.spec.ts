import { EventEmitter } from 'node:events'

import type { Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'

import { createSseHub } from '../../sse/sseHub.js'
import { sseRequestHandler } from '../sse.route.js'

function fakeReqRes() {
  const emitter = new EventEmitter()
  const res = { set: vi.fn(), flushHeaders: vi.fn(), write: vi.fn(), on: vi.fn() }
  return { emitter, req: emitter as unknown as Request, res: res as unknown as Response }
}

describe('sseRequestHandler', () => {
  it('sets SSE headers and subscribes the response to the hub', () => {
    const hub = createSseHub()
    const { req, res } = fakeReqRes()

    sseRequestHandler(hub)(req, res)

    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Content-Type': 'text/event-stream' }),
    )
    expect(res.flushHeaders).toHaveBeenCalled()
    expect(hub.size).toBe(1)
  })

  it('unsubscribes once the request closes', () => {
    const hub = createSseHub()
    const { emitter, req, res } = fakeReqRes()

    sseRequestHandler(hub)(req, res)
    emitter.emit('close')

    expect(hub.size).toBe(0)
  })
})
