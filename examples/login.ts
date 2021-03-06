import { Client } from '../src'

const client = new Client()

// connect to the server
client.connect('http://localhost:5000').then(async () => {
  console.log('Connected to server')

  client.loginTraveller('john.doe@example.com', 'password123').then(() => {
    console.log(`Logged in as '${client.traveller?.name}'`)
  }).catch(err => {
    console.log(err)
  })
})
