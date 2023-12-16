import localforage from 'localforage'

export const Expires = {
  NEVER: -1,
  HOUR: 60 * 60,
  DAY: 60 * 60 * 24,
  WEEK: 60 * 60 * 24 * 7,
  MONTH: 60 * 60 * 24 * 30,
  YEAR: 60 * 60 * 24 * 365,
  hour(count) {
    return this.HOUR * count
  },
  day(count) {
    return this.DAY * count
  },
  week(count) {
    return this.WEEK * count
  },
  month(count) {
    return this.MONTH * count
  },
  year(count) {
    return this.YEAR * count
  }
}

class Storage {
  get(key, def) {
    let result = this.drive.getItem(key)
    if (result) {
      let data = deserialize(result)

      if (Math.floor(+new Date() / 1000) >= data.expires_at && data.expires_at !== -1) {
        data.data = def
        this.remove(key)
      }

      return data.data

    } else {
      return def
    }
  }

  set(key, val, expires_at = -1) {
    try {
      if (val === undefined) {
        return this.remove(key)
      }

      if (typeof expires_at === 'number' && expires_at >= 0) {
        expires_at = Math.floor(+new Date() / 1000) + expires_at
      } else {
        expires_at = -1
      }

      let data = {
        data: val,
        expires_at
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

  get size() {
    let total = 0;
    for (let x in this.drive) {
      // Value is multiplied by 2 due to data being stored in `utf-16` format, which requires twice the space.
      let amount = (this.drive[x].length * 2);
      if (!isNaN(amount) && Object.prototype.hasOwnProperty.call(this.drive, x)) {
        total += amount;
      }
    }
    return total.toFixed(2);
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

class DB {
  constructor() {
    this.db = localforage.createInstance({ name: 'pixiv-viewer', storeName: 'cache' })

    setInterval(this.clean.bind(this), 1000 * 60)
  }

  async get(key, def) {
    const data = await this.db.getItem(key)
    if (data) {
      if (Math.floor(+new Date() / 1000) >= data.expires_at && data.expires_at !== -1) {
        data.data = def
        this.remove(key)
      }
      return data.data
    } else {
      return def
    }
  }

  async set(key, val, expires_at = -1) {
    try {
      if (val === undefined) {
        return this.remove(key)
      }

      if (typeof expires_at === 'number' && expires_at >= 0) {
        expires_at = Math.floor(+new Date() / 1000) + expires_at
      }

      let data = {
        data: val,
        expires_at
      }

      await this.db.setItem(key, data)
    } catch (e) {
      console.error(e)
    }
  }

  async remove(key) {
    await this.db.removeItem(key)
  }

  async clear() {
    await this.db.clear()
  }

  get size() {
    return new Promise((resolve, reject) => {
      let total = 0;
      this.db.iterate((value) => {
        // Value is multiplied by 2 due to data being stored in `utf-16` format, which requires twice the space.
        let amount = (JSON.stringify(value).length * 2);
        if (!isNaN(amount)) {
          total += amount;
        }
      })
        .then(() => {
          resolve(total.toFixed(2));
        })
        .catch((err) => {
          reject(err);
        })
    })
  }

  clean() {
    return new Promise((resolve, reject) => {
      this.db.iterate(async (value, key) => {
        const { expires_at } = value
        if (expires_at !== -1 && Math.floor(+new Date() / 1000) >= expires_at) {
          await this.db.removeItem(key)
        }
      })
        .then(resolve)
        .catch(reject)
    })
  }
}

export const LocalStorage = new Local()
export const SessionStorage = new Session()
export const DBStorage = new DB()

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
