const db = require('./database.js')
const express = require('express')
const app = express()
const port = 3000
const path = require('path')

app.use(express.static(path.join(__dirname, "public")))

console.log(path.join(__dirname, "public", "index.html"))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body

  const stmt = db.prepare(`
    INSERT INTO contacts (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `)
  stmt.run(name, email, subject, message)

  res.send('Message received, thank you!')
})

/* route to load all saved reaction counts when the FAQ page opens */
app.get('/reactions', (req, res) => {
  const rows = db.prepare(`SELECT faq_id, likes, hearts FROM reactions`).all()
  res.json(rows)
})

/* route to save a like or heart click */
app.post('/reactions', (req, res) => {
  const { faqId, type } = req.body

  if (!faqId || (type !== 'like' && type !== 'heart')) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  // make sure a row exists for this faqId
  db.prepare(`INSERT OR IGNORE INTO reactions (faq_id) VALUES (?)`).run(faqId)

  const column = type === 'like' ? 'likes' : 'hearts'

  db.prepare(`UPDATE reactions SET ${column} = ${column} + 1 WHERE faq_id = ?`).run(faqId)

  const row = db.prepare(`SELECT ${column} AS count FROM reactions WHERE faq_id = ?`).get(faqId)

  res.json({ count: row.count })
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:3000`)
})