import { TypedEmitter } from 'tiny-typed-emitter'
import WebSocket from 'ws'
import { Guild, GuildVisibility } from './classes/guild'

import { Traveller } from './classes/traveller'
import { ClientEvents, ServerEvents, NewTravellerData } from './utils/types'

/**
 * The `Client` class is what you will use to connect and access the TowerVerse server.
 */
export class Client extends TypedEmitter<ClientEvents> {
  ws: WebSocket | undefined
  private cache: Record<string, (data: any) => void> = {}
  private refCount = 0

  traveller: Traveller | undefined

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
      this.emit('send', event, data)

      setTimeout(() => {
        rej('Response timed out')
      }, 10000)
    })
  }

  /**
   * Connect to the server using the url provided.
   */
  connect(url: string = 'wss://towerverse.herokuapp.com'): Promise<Client> {
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
          this.emit('recv', data)
          delete this.cache[data.ref]
        }
      })
    })
  }

  /**
   * Create a traveller.
   * The traveller will still need to be verified.
   */
  createTraveller(travellerData: NewTravellerData): Promise<Traveller> {
    return new Promise((res, rej) => {
      if (this.traveller && this.traveller.email) throw Error(`Already logged in as ${this.traveller.name}`)
      this.send('createTraveller', travellerData).then(response => {
        if (response.event !== 'createTravellerReply') rej(response.data.errorMessage)

        const traveller = new Traveller(this, {...travellerData, ...response.data})

        res(traveller)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Disconnect from the TowerVerse server
   */
  disconnect() {
    if (!this.ws || !this.ws.CLOSED) throw Error('WebSocket not connected')

    this.ws.close()
    this.emit('disconnect')
  }

  /**
   * Login as an existing traveller
   */
  loginTraveller(travellerEmail: string, travellerPassword: string): Promise<Client> {
    return new Promise((res, rej) => {
      this.send('loginTraveller', {travellerEmail, travellerPassword}).then(async response => {
        if (response.event !== 'loginTravellerReply') rej(response.data.errorMessage)

        const travellerData = await this.send('fetchTraveller', {...response.data})

        const traveller = new Traveller(this, {...travellerData.data})

        this.traveller = traveller
        res(this)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Fetch a traveller using their id.
   */
  fetchTraveller(travellerId: string): Promise<Traveller> {
    return new Promise((res, rej) => {
      this.send('fetchTraveller', {travellerId}).then(response => {
        if (response.event !== 'fetchTravellerReply') rej(response.data.errorMessage)

        const traveller = new Traveller(this, {...response.data})

        res(traveller)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Request a password reset
   */
  resetPasswordRequest(travellerEmail: string, oldTravellerPassword: string, newTravellerPassword: string) {
    return new Promise((res, rej) => {
      this.send('resetTravellerPassword', {
        travellerEmail,
        oldTravellerPassword,
        newTravellerPassword
      }).then(response => {
        if (response.event !== 'resetTravellersPasswordReply') rej(response.data.errorMessage)
        res(response.data)
      })
    })
  }

  /**
   * Confirm a password reset with the code from the email
   */
  resetPasswordConfirm(travellerEmail: string, travellerPasswordCode: string) {
    return new Promise((res, rej) => {
      this.send('resetTravellerPasswordFinal', {
        travellerEmail,
        travellerPasswordCode
      }).then(response => {
        if (response.event !== 'resetTravellerPasswordFinalReply') rej(response.data.errorMessage)
        res(response.data)
      })
    })
  }

  /**
   * List all travellers
   */
  listTravellers(): Promise<string[]> {
    return new Promise((res, rej) => {
      this.send('fetchTravellers', {}).then(response => {
        if (response.event !== 'fetchTravellersReply') rej(response.data.errorMessage)
        res(response.data.travellerIds)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Get the total number of travellers
   */
  totalTravellers(): Promise<number> {
    return new Promise((res, rej) => {
      this.send('totalTravellers', {}).then(response => {
        if (response.event !== 'totalTravellersReply') rej(response.data.errorMessage)
        res(response.data.totalTravellers)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Get the total number of travellers currently online
   */
  onlineTravellers(): Promise<number> {
    return new Promise((res, rej) => {
      this.send('onlineTravellers', {}).then(response => {
        if (response.event !== 'onlineTravellersReply') rej(response.data.errorMessage)
        res(response.data.onlineTravellers)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Create a guild
   */
  createGuild(name: string, description: string, visibility: GuildVisibility, maxMembers: number): Promise<Guild> {
    return new Promise((res, rej) => {
      this.send('createGuild', {name, description, visibility, maxMembers}).then(response => {
        if (response.event !== 'createGuildReply') rej(response.data.errorMessage)

        const guild = new Guild(this, {name, description, visibility, creator: this.traveller?.id ?? '', members: [this.traveller?.id ?? ''], maxMembers, id: response.data.guildId})

        res(guild)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Join a guild
   */
  joinGuild(guildId: string): Promise<string> {
    return new Promise((res, rej) => {
      this.send('joinGuild', {guildId}).then(response => {
        if (response.event !== 'joinGuildReply') rej(response.data.errorMessage)
        res(response.data.guildId)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Fetch a guild
   */
  fetchGuild(guildId: string): Promise<Guild> {
    return new Promise((res, rej) => {
      this.send('fetchGuild', {guildId}).then(response => {
        if (response.event !== 'fetchGuildReply') rej(response.data.errorMessage)

        const guild = new Guild(this, {...response.data})

        res(guild)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Fetch a list of guilds
   */
  listGuilds(): Promise<string[]> {
    return new Promise((res, rej) => {
      this.send('fetchGuilds', {}).then(response => {
        if (response.event !== 'fetchGuildsReply') rej(response.data.errorMessage)
        res(response.data.guildIds)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Get the current guild
   */
  currentGuild(): Promise<Guild> {
    return new Promise((res, rej) => {
      this.send('currentGuild', {}).then(response => {
        if (response.event !== 'currentGuildReply') rej(response.data.errorMessage)

        const guild = new Guild(this, {...response.data})

        res(guild)
      }).catch(err => {
        rej(err)
      })
    })
  }

  /**
   * Leave the current guild
   */
  leaveGuild(): Promise<void> {
    return new Promise((res, rej) => {
      this.send('leaveGuild', {}).then(response => {
        if (response.event !== 'leaveGuildReply') rej(response.data.errorMessage)
        res()
      }).catch(err => {
        rej(err)
      })
    })
  }
}
