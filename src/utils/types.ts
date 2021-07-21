export interface NewTravellerData {
  travellerName: string
  travellerEmail: string
  travellerPassword: string
}

export type ServerEvents =
  'createTraveller' |
  'fetchTraveller' |
  'fetchTravellers' |
  'loginTraveller' |
  'logoutTraveller' |
  'totalTravellers' |
  'onlineTravellers' |
  'verifyTraveller' |
  'resendTravellerCode' |
  'resetTravellerPassword' |
  'resetTravellerPasswordFinal' |
  'resetTravellerPasswordAccount' |
  'resetTravellerName'|
  // Guilds
  'createGuild' |
  'joinGuild' |
  'fetchGuild' |
  'fetchGuilds' |
  'currentGuild' |
  'leaveGuild'

export interface ClientEvents {
  'connect': () => void
  'disconnect': () => void
  'send': (event: string, data: any) => void
  'recv': (data: any) => void
}
