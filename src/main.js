import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Dayjs from '@/components/dayjs'
import Icon from 'vue-svg-icon/Icon.vue'
import { Toast, Lazyload, ImagePreview } from 'vant';
import '@vant/touch-emulator';
import VueAwesomeSwiper from 'vue-awesome-swiper'
import VCalendar from 'v-calendar';
import waterfall from 'vue-waterfall2'
import { isMobileOnly as isMobile, isMobileSafari, isAndroid, isIOS, isBrowser as isPC } from 'mobile-device-detect'

import 'swiper/css/swiper.css'
import '@/assets/css/base.styl'

// import '@/assets/css/iconfont/iconfont.js'

import './polyfill'

import './registerServiceWorker'

Vue.use(Dayjs);
Vue.use(Toast);
Vue.use(Lazyload, {
  lazyComponent: true,
  loading: require('@/svg/loading.svg')
})
Vue.use(ImagePreview);
Vue.use(VueAwesomeSwiper)
Vue.use(VCalendar)
Vue.use(waterfall)

Vue.component('Icon', Icon)

Vue.config.productionTip = true

document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});

Vue.prototype.$env = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isDebug: location.search.indexOf('debug=1') > -1,
  isMobile, isMobileSafari, isAndroid, isIOS, isPC,
  docTitle: document.title,
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
