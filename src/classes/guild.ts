import { TypedEmitter } from "tiny-typed-emitter"
import { Client } from "../client"

interface GuildEvents {
}

interface GuildData {
  id: string
  name: string
  description: string
  creator: string
  visibility: string
  maxMembers: number
  members: string[]
}

export type GuildVisibility = "public" | "private"

export class Guild extends TypedEmitter<GuildEvents> {
  client: Client
  id: string
  name: string
  description: string
  creator: string
  visibility: string
  maxMembers: number
  members: string[]

  constructor(client: Client, data: GuildData) {
    super()
    this.client = client
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.creator = data.creator
    this.visibility = data.visibility
    this.maxMembers = data.maxMembers
    this.members = data.members
  }
}
