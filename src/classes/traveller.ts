import { TypedEmitter } from "tiny-typed-emitter"
import { Client } from "../client"

export interface TravellerEvents {
  'logout': () => void
}

export interface TravellerData {
  travellerId: string
  travellerName: string
  travellerEmail: string | undefined
}

/**
 * The `Traveller` class represents a traveller.
 * This may be the traveller the client has signed into, or another traveller on the platform.
 */
export class Traveller extends TypedEmitter<TravellerEvents> {
  id: string
  name: string
  email: string | undefined
  client: Client

  constructor(client: Client, traveller: TravellerData) {
    super()
    this.client = client
    this.id = traveller.travellerId
    this.name = traveller.travellerName
    this.email = traveller.travellerEmail
  }

  /**
   * Log out of the current traveller account.
   * This will remove the current traveller object on the client.
   */
  async logout() {
    await this.client.send('logoutTraveller', {})
    this.client.traveller = undefined
    this.emit('logout')
  }
}
