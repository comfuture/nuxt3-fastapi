import { defineNuxtPlugin, useFetch } from '#app'

// XXX: plugin template does not honor typescript syntax in nuxt3
export default defineNuxtPlugin(nuxtApp => {
  return {
    provide: {
      api(url, options = {headers: {accept: ''}}) {
        // method: Request method
        // params: Query params
        // headers: Request headers
        // baseURL: Base URL for the request
        let baseURL = ''
        if (process.server) {
          baseURL = 'http://localhost:4000'
        }
        options.headers.accept = 'application/json'
        return useFetch(url, {...options, baseURL, server: true})
      }
    }
  }
})
