import axios from 'axios'
import store from '@/store'

const baseURL = 'https://hibiapi.journeyad.repl.co/api/'

axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/json'

const get = async (url, params) => {
  try {
    const { SETTING } = store.state

    const res = await axios.get(url, {
      baseURL: SETTING.api || baseURL,
      params
    })

    return new Promise((resolve, reject) => {
      let data = res.data
      if (typeof data === 'object') {
        resolve(data)
      } else {
        reject(data)
      }
    })
  } catch (ex) {
    console.error(ex)
  }
}

const post = async (url, data) => {
  try {

    const { SETTING } = store.state
    const res = await axios.post(url,
      data,
      { baseURL: SETTING.api || baseURL }
    ).data

    return new Promise((resolve, reject) => {
      let data = res.data
      if (typeof res === 'object') {
        resolve(data)
      } else {
        reject(data)
      }
    })
  } catch (ex) {
    console.error(ex)
  }
}

export { get, post }
