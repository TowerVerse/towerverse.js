import { TypedEmitter } from 'tiny-typed-emitter'
import WebSocket from 'ws'

import { User } from './classes/user'
import { ClientEvents, ServerEvents, NewTravellerData } from './utils/types'

/**
 * The `Client` class is what you will use to connect and access the OpenDoge server.
 */
export class Client extends TypedEmitter<ClientEvents> {
  ws: WebSocket | undefined
  private cache: Record<string, (data: any) => void> = {}
  private refCount = 0

  user: User | undefined

  constructor() {
    super()
  }

  send(event: ServerEvents, data): Promise<any> {
    return new Promise((res, rej) => {
      if (!this.ws) throw Error('Web socket is closed')

      data.ref = this.refCount.toString()
      this.refCount++

      this.cache[data.ref] = data => {
        res(data)
      }

      this.ws.send(JSON.stringify({...data, event}))

      setTimeout(() => {
        rej('Response timed out')
      }, 10000)
    })
  }

  /**
   * Connect to the server using the url provided.
   */
  connect(url: string = 'wss://opendoge.herokuapp.com'): Promise<Client> {
    if (this.ws?.OPEN) throw Error('Connection already established')

    return new Promise((res, rej) => {
      this.ws = new WebSocket(url)
      this.ws.once('open', () => {
        this.emit('connect')
        res(this)
      })

      this.ws.on('message', (data: any) => {
        data = JSON.parse(data)
        if (this.cache[data.ref]) {
          this.cache[data.ref](data)
          delete this.cache[data.ref]
        }
      })
    })
  }

  /**
   * Create a user
   */
  createUser(traveller: NewTravellerData): Promise<Client> {
    return new Promise((res, rej) => {
      this.send('createTraveller', traveller).then(response => {
        if (response.event !== 'createTravellerReply') rej(response.data.errorMessage)

        const user = new User(this, {...traveller, ...response.data})

        this.user = user
        res(this)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Disconnect from the OpenDoge server
   */
  disconnect() {
    if (!this.ws || !this.ws.CLOSED) throw Error('WebSocket not connected')

    this.ws.close()
    this.emit('disconnect')
  }

  /**
   * Login as an existing user
   */
  loginUser(travellerEmail: string, travellerPassword: string) {
    return new Promise((res, rej) => {
      this.send('loginTraveller', {travellerEmail, travellerPassword}).then(async response => {
        if (response.event !== 'loginTravellerReply') rej(response.data.errorMessage)

        const userData = await this.send('fetchTraveller', {...response.data})

        const user = new User(this, {...userData.data})

        this.user = user
        res(this)
      }).catch(err => {
        rej(err)
      })
    })
  }
}
