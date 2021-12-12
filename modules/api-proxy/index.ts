import { defineNuxtModule, addServerMiddleware, addPluginTemplate } from '@nuxt/kit'
import { AsyncData } from '#app/composables/asyncData'
import type { IncomingMessage } from 'http'

import { resolve } from 'pathe'
import { spawn } from 'child_process'
import { createProxyMiddleware } from 'http-proxy-middleware'
import accepts from 'accepts'

declare module '#app' {
  interface NuxtApp {
    $api (url: string, options?: any): AsyncData<Pick<unknown, never>>
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api (url: string, options?: any): AsyncData<Pick<unknown, never>>
  }
}

interface ProxyRule {
  (pathname: string, req: IncomingMessage): boolean;
}

interface APIProxyModuleOptions {
  proxyRule?: ProxyRule,
  backendHost: string,
  backendPort: number | string
}


const APIProxyModule = defineNuxtModule<APIProxyModuleOptions>({
  name: 'api-proxy',
  configKey: 'apiProxy',
  defaults: {
    proxyRule: () => false,
    backendHost: '127.0.0.1',
    backendPort: 4000
  },
  async setup(options, nuxt) {
    const { proxyRule, backendHost, backendPort } = options
    /**
     * negotiates whether flask should process the request or not.
     * defaults to all requests that accept first to json and
     * all methods except GET will proxied to :4000
     * @param {string} pathname
     * @param {import('http').RequestOptions} req
     */
    const negotiate = (pathname: string, req: IncomingMessage) => {
      /* eslint-disable operator-linebreak */
      return accepts(req).type(['html', 'json']) === 'json'
        || req.method !== 'GET'
        || proxyRule(pathname, req)
    }

    // provide server middleware
    addServerMiddleware({
      path: '/',
      handler: createProxyMiddleware(negotiate, {
        target: `http://${backendHost}:${backendPort}`
      })
    })

    // provide plugin
    addPluginTemplate({
      filename: 'plugin.ts',
      src: resolve(__dirname, 'plugin.ts'),
      options: {
        backendPort
      }
    })

    let backend

    nuxt.hook('modules:done', (moduleContainer) => {
      console.info('hook modules:done')
      backend = spawn('uvicorn', ['--port', '' + backendPort, 'server:app'], {
        env: process.env,
        detached: true,
        stdio: [0, 'pipe', process.stderr]
      })
      backend.unref()
      backend.ref()
      console.info('Backend process spawned')
      backend.stdout.on('data', buffer => console.log(buffer.toString('utf8')))
    })
  
    nuxt.hook('close', (nuxt) => {
      console.info('Backend process closed')
      backend?.kill('SIGTERM')
    })
  
    process.on('SIGINT', () => {
      console.info('Backend process closed by SIGINT')
      backend?.kill('SIGTERM')
      process.exit()
    })
  }
})

export default APIProxyModule
