import { defineStore } from 'pinia'
import { ref } from 'vue'

import { mergeTimeSlotUpdate, type TimeSlot } from '../domain/timeSlot.js'
import { fetchTimeSlots } from '../services/timeSlotsApi.js'
import { subscribeToTimeSlotUpdates } from '../services/timeSlotsSse.js'

export type TimeSlotsStatus = 'idle' | 'loading' | 'error'

export const useTimeSlotsStore = defineStore('timeSlots', () => {
  const slots = ref<TimeSlot[]>([])
  const status = ref<TimeSlotsStatus>('idle')
  let stopSse: (() => void) | undefined

  async function load(): Promise<void> {
    status.value = 'loading'
    try {
      slots.value = await fetchTimeSlots()
      status.value = 'idle'
    } catch {
      status.value = 'error'
    }
  }

  function subscribe(): void {
    stopSse?.()
    stopSse = subscribeToTimeSlotUpdates((update) => {
      slots.value = mergeTimeSlotUpdate(slots.value, update)
    })
  }

  function unsubscribe(): void {
    stopSse?.()
    stopSse = undefined
  }

  return { slots, status, load, subscribe, unsubscribe }
})
