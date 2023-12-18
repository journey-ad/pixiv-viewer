export const setThemeColor = (color) => {
  if (!color) return

  let metaThemeColor = document.querySelector('meta[name="theme-color"]')

  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta')
    metaThemeColor.setAttribute('name', 'theme-color')
    document.head.appendChild(metaThemeColor)
  }

  metaThemeColor.setAttribute('content', color)
}

export const dateFormat = (ts, fmt = 'yyyy-MM-dd hh:mm:ss') => {
  if (!ts) ts = new Date()

  if (typeof ts === 'number' && ts.toString().length === 10) {
    ts *= 1000
  }

  const date = ts instanceof Date ? ts : new Date(ts)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`)
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : `00${str}`.substr(str.length))
    }
  }
  return fmt
}