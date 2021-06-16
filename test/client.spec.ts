import { expect } from 'chai'
import { Client } from '../src'

let client: Client

describe('Client', () => {
  before('should be created without error', () => {
    client = new Client()
  })

  it('should not allow disconnecting a not connected socket', () => {
    try {
      client.disconnect()
      throw Error('Disconnected')
    } catch (err) {
      expect(err.message).to.equal('WebSocket not connected')
    }
  })
})
