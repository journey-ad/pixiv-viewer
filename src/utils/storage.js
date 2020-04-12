class Storage {
  get(key, def) {
    let result = this.drive.getItem(key)
    if (result) {
      let data = deserialize(result)

      if (Math.floor(+new Date() / 1000) >= data.expires && data.expires !== -1) {
        data.data = def
        this.remove(key)
      }

      return data.data

    } else {
      return def
    }
  }

  set(key, val, expires = -1) {
    try {
      if (val === undefined) {
        return this.remove(key)
      }

      if (typeof expires === 'number' && expires >= 0) {
        expires = Math.floor(+new Date() / 1000) + expires
      } else {
        expires = -1
      }

      let data = {
        data: val,
        expires
      }

      this.drive.setItem(key, serialize(data))
    }
    catch (e) {
      console.log("Local Storage is full, Please empty data");
    }
    return val
  }

  has(key) {
    return this.get(key) !== undefined
  }

  remove(key) {
    this.drive.removeItem(key)
  }

  clear() {
    this.drive.clear()
  }
}

class Local extends Storage {
  constructor() {
    super()
    this.drive = window.localStorage
  }
}

class Session extends Storage {
  constructor() {
    super()
    this.drive = window.sessionStorage
  }
}

export const LocalStorage = new Local()
export const SessionStorage = new Session()

function serialize(val) {
  return JSON.stringify(val)
}

function deserialize(val) {
  if (typeof val !== 'string') {
    return undefined
  }
  try {
    return JSON.parse(val)
  } catch (e) {
    return val || undefined
  }
}
