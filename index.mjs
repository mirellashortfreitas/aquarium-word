import db from './database.js'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 5000

//EJS - View engine

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Middlewares

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


/*App gets - page routes*/

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/zones', (req, res) => {
    res.render('zones')
})

app.get('/faq', (req, res) => {
  db.all(`SELECT * FROM faqs ORDER BY id ASC`, [], (err, faqs) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error loading FAQs')
    }

    db.all(`SELECT faq_id, likes, hearts FROM reactions`, [], (err, rows) => {
      if (err) {
        console.error(err)
        return res.status(500).send('Error loading reactions')
      }

      const reactionsMap = {}
      rows.forEach(row => {
        reactionsMap[row.faq_id] = { likes: row.likes, hearts: row.hearts }
      })

      res.render('faq', { faqs, reactionsMap })
    })
  })
})

app.get('/contact', (req, res) => {
    res.render('contact')
})

app.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  db.run(
    `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`,
    [name, email, subject, message],
    function (err) {
      if (err) {
        console.error(err)
        return res.status(500).json({ error: 'Error saving message' })
      }
      res.json({ success: true, message: 'Message received, thank you!' })
    }
  )
})

/* Global search */

const SITE_PAGES = [
  { title: 'Home', description: 'Welcome to Aquarium World, explore our marine zones and exhibits.', url: '/' },
  { title: 'Zones', description: 'Discover our themed zones, from coral reefs to the deep sea.', url: '/zones' },
  { title: 'Events', description: 'Workshops, tours, talks and festivals happening at the aquarium.', url: '/events' },
  { title: 'FAQ', description: 'Answers to common questions about visiting Aquarium World.', url: '/faq' },
  { title: 'Contact', description: 'Get in touch with the Aquarium World team.', url: '/contact' }
]

/* route to load all saved reaction counts when the FAQ page opens */

app.get('/reactions', (req, res) => {
  db.all(`SELECT faq_id, likes, hearts FROM reactions`, [], (err, rows) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Error fetching reactions' })
    }
    res.json(rows)
  })
})

/*Route to add get events */

app.get('/events', (req, res) => {
  db.all(`SELECT * FROM events ORDER BY id ASC`, [], (err, rows) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error loading events')
    }
    res.render('events', { events: rows })
  })
})


/* Route event AJAX*/

app.get('/api/events/search', (req, res) => {
  const query = req.query.q || ''

  db.all(
    `SELECT * FROM events WHERE title LIKE ? OR event_type LIKE ? ORDER BY id ASC`,
    [`%${query}%`, `%${query}%`],
    (err, rows) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ error: 'Error searching events' })
      }
      res.json(rows)
    }
  )
})

/* Global Search - Pages, FAQ (database) and events */

app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase()
  if (!q) {
    return res.json([])
  }
  const results = []

  // 1. Site pages
  SITE_PAGES.forEach(page => {
    if (page.title.toLowerCase().includes(q) || page.description.toLowerCase().includes(q)) {
      results.push({ type: 'Page', title: page.title, snippet: page.description, url: page.url })
    }
  })

  // 2. FAQ questions (now coming from the database)
  db.all(
    `SELECT id, question, answer FROM faqs WHERE question LIKE ? OR answer LIKE ? ORDER BY id ASC`,
    [`%${q}%`, `%${q}%`],
    (err, faqRows) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ error: 'Error searching FAQs' })
      }
      faqRows.forEach(faq => {
        results.push({ type: 'FAQ', title: faq.question, snippet: faq.answer, url: `/faq#faq-${faq.id}` })
      })

      // 3. Events (database)
      db.all(
        `SELECT title, event_type, description FROM events WHERE title LIKE ? OR description LIKE ? OR event_type LIKE ? ORDER BY id ASC`,
        [`%${q}%`, `%${q}%`, `%${q}%`],
        (err, eventRows) => {
          if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Error searching events' })
          }
          eventRows.forEach(event => {
            results.push({ type: 'Event', title: event.title, snippet: event.description, url: '/events' })
          })
          res.json(results)
        }
      )
    }
  )
})

/* route to save a like or heart click */

app.post('/reactions', (req, res) => {
  const { faqId, type } = req.body
  const COLUMN_MAP = { like: 'likes', heart: 'hearts' }
  const column = COLUMN_MAP[type]

  if (!faqId || !column) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  // make sure a row exists for this faqId
  db.run(`INSERT OR IGNORE INTO reactions (faq_id) VALUES (?)`, [faqId], (err) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Error creating reaction' })
    }

    db.run(`UPDATE reactions SET ${column} = ${column} + 1 WHERE faq_id = ?`, [faqId], (err) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ error: 'Error updating reaction' })
      }

      db.get(`SELECT ${column} AS count FROM reactions WHERE faq_id = ?`, [faqId], (err, row) => {
        if (err) {
          console.error(err)
          return res.status(500).json({ error: 'Error fetching count' })
        }
        res.json({ count: row.count })
      })
    })
  })
})

/*On live clock*/

app.get('/server-time', (req, res) => {
  db.get(`SELECT datetime('now', 'localtime') AS time`, [], (err, row) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Error fetching time' })
    }
    res.json({ time: row.time })
  })
})

app.use((req, res) => {          
  res.status(404).send('Page not found')
})

/*localhost*/

app.listen(port, () => {
     console.log(`Server running at http://localhost:5000`)
})
