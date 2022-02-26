import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  buildModules: [
    'nuxt-windicss'
  ],
  modules: [
    ['~/modules/api-proxy', {
      backendPort: 4000
    }]
  ]
})
