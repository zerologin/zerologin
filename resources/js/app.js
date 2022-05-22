import 'element-plus/dist/index.css'
import '../css/element.scss'
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/inertia-vue3'
import ElementPlus from 'element-plus'
import Layout from './Layouts/Main'

createInertiaApp({
  resolve: name => {
    const page = require(`./Pages/${name}`).default
    if (page.layout === undefined && !name.startsWith('Public/')) {
      page.layout = Layout
    }
    return page
  },
  setup({ el, App, props, plugin }) {
    const app = createApp({ render: () => h(App, props) })
      app.use(plugin)
      app.use(ElementPlus)
      app.mount(el)
  },
})
