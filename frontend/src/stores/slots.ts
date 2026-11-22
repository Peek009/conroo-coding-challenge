import { defineStore } from 'pinia'
import { ref } from 'vue'

import { mergeTimeSlotUpdate, type TimeSlot, type TimeSlotUpdate } from '../domain/timeSlot.js'
import { fetchTimeSlots } from '../services/timeSlotsApi.js'

export type SlotsStatus = 'idle' | 'loading' | 'error'
export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting' | 'offline'

export const useSlotsStore = defineStore('slots', () => {
  const slots = ref<TimeSlot[]>([])
  const status = ref<SlotsStatus>('idle')
  const connection = ref<ConnectionStatus>('connecting')
  const lastUpdateAt = ref<Date | null>(null)

  function touch(): void {
    lastUpdateAt.value = new Date()
  }

  async function load(): Promise<void> {
    status.value = 'loading'
    try {
      slots.value = await fetchTimeSlots()
      status.value = 'idle'
      touch()
    } catch {
      status.value = 'error'
    }
  }

  function applyUpdate(update: TimeSlotUpdate): void {
    slots.value = mergeTimeSlotUpdate(slots.value, update)
  }

  function setConnection(state: ConnectionStatus): void {
    connection.value = state
  }

  return { slots, status, connection, lastUpdateAt, load, applyUpdate, setConnection, touch }
})
