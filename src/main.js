import Vue from 'vue'
import App from './App'
import store from './store'
import md5 from 'js-md5';

Vue.prototype.$md5 = md5;
Vue.config.productionTip = false
Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
    store,
    ...App
})
app.$mount()
