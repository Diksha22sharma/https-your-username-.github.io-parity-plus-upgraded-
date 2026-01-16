import { Violation } from '../types'

// Shared violations store
let violationsStore: Violation[] = []

export const setViolations = (violations: Violation[]) => {
  violationsStore = violations
}

export const getViolations = (): Violation[] => {
  return violationsStore
}

export const updateViolation = (violationId: string, updates: Partial<Violation>) => {
  violationsStore = violationsStore.map(v => 
    v.id === violationId ? { ...v, ...updates } : v
  )
}

export const getViolationById = (violationId: string): Violation | undefined => {
  return violationsStore.find(v => v.id === violationId)
}
