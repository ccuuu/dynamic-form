// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import ContextMenu from './context-menu'

import 'element-ui/lib/theme-chalk/index.css'

Vue.prototype.$contextMenu = ({ options, event }) => {
  if (document.querySelector('.context-menu')) return
  const createMenu = Vue.extend({
    ...ContextMenu,
    data() {
      return {
        ...ContextMenu.data(),
        options: Object.keys(options),
        pageX: event.pageX,
        pageY: event.pageY,
      }
    },
    methods: {
      ...ContextMenu.methods,
      ...options,
    },
  })

  const contextMenuEle = new createMenu().$mount().$el
  document.body.appendChild(contextMenuEle)
}

Vue.use(ElementUI)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
})
