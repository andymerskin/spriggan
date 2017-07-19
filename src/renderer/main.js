import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import 'tachyons'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

document.addEventListener('dragover', function(e) {
  e.preventDefault()
  return false
}, false)

document.addEventListener('drop', function(e) {
  e.preventDefault()
  return false
}, false)