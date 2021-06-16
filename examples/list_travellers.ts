import { Client } from '../src'

const client = new Client()

// connect to the server
client.connect('http://localhost:5000').then(async () => {
  console.log('Connected to server')

  client.listTravellers().then(data => {
    console.log(`Found '${data.length}' travellers:`)
    for (let i = 0; i < data.length; i++) {
      const id = data[i];
      console.log('\t'+id)
    }
  }).catch(err => {
    console.log(err)
  })
})
