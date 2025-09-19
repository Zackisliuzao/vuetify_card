import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Create Vuetify instance for testing
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
})

// Create Pinia instance for testing
const pinia = createPinia()

// Configure Vue Test Utils global plugins
config.global.plugins = [vuetify, pinia]

// Mock window.alert
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true
})

// Mock console methods to reduce noise in tests
Object.defineProperty(console, 'warn', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(console, 'error', {
  value: vi.fn(),
  writable: true
})