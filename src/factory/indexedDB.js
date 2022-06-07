const ModelEnum = {
  IndexedDB: 'INDEXED_DB',
  Storage: 'STORAGE',
}
const cryptoBuffer = new Uint32Array(1)

class IndexedDB {
  constructor() {
    this.model = ModelEnum.IndexedDB
    this.database = null
    this.objectStore = null
    this.index = null
    this.data = {}
    this.version =
      window.localStorage.getItem('dynamic_form_version') || this.setVersion(1)
    this.dirty = true
    this.userIds = []
    this._init()
  }
  setVersion(v) {
    v = v + ''
    if (v / 1 <= this.version / 1) return
    window.localStorage.setItem('dynamic_form_version', v)
    this.version = v
    this._init()
    return v
  }
  async _init() {
    console.log('_init', this.version)

    await this._initDatabase()
    this.read()
  }

  _initDatabase() {
    const request = indexedDB.open('dynamic_form_database', this.version)

    return new Promise((resolve) => {
      request.onupgradeneeded = (e) => {
        console.log('onupgradeneeded')
        const db = (this.database = e.target.result)
        if (db.objectStoreNames.contains('dynamic_form_database')) {
          db.deleteObjectStore('dynamic_form_database')
        }
        this.objectStore = db.createObjectStore('dynamic_form_database', {
          keyPath: 'userId',
        })
        this.index = this.objectStore.createIndex('default', 'default', {
          unique: false,
        })
        resolve()
      }
      request.onsuccess = (e) => {
        console.log('success open')

        const db = (this.database = e.target.result)
        this.objectStore = db
          .transaction(['dynamic_form_database'], 'readwrite')
          .objectStore('dynamic_form_database')
        this.index = this.objectStore.index('default')
        resolve()
      }
      request.onerror = () => {
        console.log('error')
        this.model = ModelEnum.Storage
        resolve()
      }
    })
  }

  _watchVersion() {
    this.database.onversionchange = () => {
      console.log('onversionchange')
      this.database.close()
      this.database = null
    }
  }

  write(val) {
    if (this.model === ModelEnum.IndexedDB && !this.database) return
    this.dirty = true
    const userId = (val.userId =
      Date.parse(new Date()) + '' + crypto.getRandomValues(cryptoBuffer)[0])

    if (this.model === ModelEnum.Storage) {
      this.database[userId] = val
      window.localStorage.setItem(
        'dynamic_form_database',
        JSON.stringify(this.database)
      )
      return
    }
    const request = this.objectStore.add(val)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('write success')
        this.userIds.push(userId)
        this.read()
        resolve()
      }
      request.onerror = reject
    })
  }

  read() {
    if (this.model === ModelEnum.IndexedDB && !this.database) return
    if (this.data && !this.dirty) return this.data

    if (this.model === ModelEnum.Storage) {
      return (this.data = window.localStorage.getItem['dynamic_form_database'])
    }

    if (!Object.keys(this.data).length) {
      const request = this.objectStore.openCursor()
      request.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor) {
          const { value, key } = cursor
          console.log(cursor, value, key)
          cursor.continue()
        }
      }
    }

    this.dirty = false
    return this.data
  }
  remove() {}
  clear() {}
}
