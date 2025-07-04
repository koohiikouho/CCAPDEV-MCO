import express from 'express'
const app = express()
const port = 3000

app.get('/labs', (req, res) => {
  res.send('Hello World!')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`labclub api listening on ${port}`)
})
