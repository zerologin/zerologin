import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/inertia-vue3'
import Layout from './Layouts/Main'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import '@zerologin/elements'

createInertiaApp({
  resolve: (name) => {
    const page = require(`./Pages/${name}`).default
    if (page.layout === undefined && !name.startsWith('Public/')) {
      page.layout = Layout
    }
    return page
  },
  setup({ el, App, props, plugin }) {
    const app = createApp({ render: () => h(App, props) })
    app.use(plugin)
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
    app.mount(el)
  },
})
