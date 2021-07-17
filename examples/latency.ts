import { Client } from '../src'
import { performance } from 'perf_hooks'

const client = new Client()

async function test() {
  await client.connect()
  const t1 = performance.now()
  await client.send('totalTravellers', {})
  const t2 = performance.now()
  console.log(`Latency: ${t2 - t1}ms`)
  client.disconnect()
}

test()
