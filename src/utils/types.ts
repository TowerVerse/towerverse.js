export interface NewTravellerData {
  travellerName: string
  travellerEmail: string
  travellerPassword: string
}

export type ServerEvents =
  'createTraveller' |
  'fetchTraveller'  |
  'fetchTravellers' |
  'loginTraveller'  |
  'logoutTraveller' |
  'totalTravellers'

export interface ClientEvents {
  'connect': () => void
  'disconnect': () => void
}
