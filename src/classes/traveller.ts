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

  /**
   * Verify a user.
   * If successful, it will login the user.
   * Returns true if successful or if already verified.
   */
  async verify(code: string) {
    if (this.email) return true
    const res = await this.client.send('verifyTraveller', {
      travellerId: this.id,
      travellerCode: code
    })
    if (res.event === 'verifyTravellerNotFound') throw Error('Traveller was not found')
    if (res.event === 'verifyTravellerInvalidCode') return false

    const travellerData = await this.client.send('fetchTraveller', {travellerId: this.id})

    const traveller = new Traveller(this.client, {...travellerData.data})

    this.client.traveller = traveller

    return true
  }
}
