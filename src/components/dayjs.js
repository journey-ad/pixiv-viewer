import dayjs from 'dayjs'
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

export default {
  install(Vue) {
    Vue.dayjs = dayjs
    Vue.prototype.$dayjs = dayjs

    Vue.filter('dayjs', function (value, format = 'YYYY-MM-DD HH:mm:ss') {
      return dayjs(value).format(format)
    })
  }
}