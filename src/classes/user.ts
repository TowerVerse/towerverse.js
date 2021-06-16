import { TypedEmitter } from "tiny-typed-emitter"
import { Client } from "../client"

export interface UserEvents {
  'logout': () => void
}

export interface UserData {
  travellerId: string
  travellerName: string
  travellerEmail: string | undefined
}

/**
 * The `User` class represents a user.
 * This may be the user the client has signed into, or another user on the platform.
 */
export class User extends TypedEmitter<UserEvents> {
  id: string
  name: string
  email: string | undefined
  client: Client

  constructor(client: Client, user: UserData) {
    super()
    this.client = client
    this.id = user.travellerId
    this.name = user.travellerName
    this.email = user.travellerEmail
  }

  /**
   * Log out of the current user account.
   * This will remove the current user object on the client.
   */
  async logout() {
    await this.client.send('logoutTraveller', {})
    this.client.user = undefined
    this.emit('logout')
  }
}
