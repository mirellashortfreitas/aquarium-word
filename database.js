const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const db = new sqlite3.Database(path.join(__dirname, 'aquarium.db'))

db.serialize(() => {

  // table contacts
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // table reactions
  db.run(`
    CREATE TABLE IF NOT EXISTS reactions (
      faq_id INTEGER PRIMARY KEY,
      likes INTEGER NOT NULL DEFAULT 0,
      hearts INTEGER NOT NULL DEFAULT 0
    )
  `)

  // table events
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      event_date TEXT NOT NULL,
      image TEXT
    )
  `)

  db.get(`SELECT COUNT(*) AS count FROM events`, [], (err, row) => {
    if (err) {
      console.error(err)
      return
    }

    if (row.count === 0) {
      const sampleEvents = [
        ['Marine Conservation Workshop', 'Workshop', 'Join our marine biologists for a hands-on session about ocean conservation and how you can help protect marine life.', 'September 12, 2026', '/res/imagens/workshop.png'],
        ['Halloween Torchlight Tour', 'Tour', 'Explore the aquarium after dark, guided only by torchlight, and discover the creatures that come alive at night.', 'October 25–31, 2026', '/res/imagens/torchlight.png'],
        ['Autumn Marine Festival', 'Festival', 'A full day of family activities, keeper talks, and live music celebrating the ocean.', 'November 8, 2026', '/res/imagens/festival.png'],
        ['Meet the Marine Biologist', 'Talk', 'An evening talk with one of our senior marine biologists about life in the deep sea.', 'December 3, 2026', '/res/imagens/talk.png'],
        ['Coral Reef Restoration Day', 'Workshop', 'A hands-on session showing how our team grows and replants coral fragments to help restore damaged reefs.', 'January 17, 2027', '/res/imagens/coral.png'],
        ['Shark Feeding Experience', 'Tour', 'Get an up-close look at feeding time in the shark tank, guided by one of our expert keepers.', 'February 14, 2027', '/res/imagens/shark.png'],
        ['World Ocean Day Celebration', 'Festival', 'A special day of exhibits, games, and talks dedicated to raising awareness about ocean health and sustainability.', 'June 8, 2027', '/res/imagens/oceanday.png'],
        ['Behind the Scenes: Aquarium Keepers', 'Tour', 'A guided backstage tour showing how our keepers care for the animals, from feeding routines to tank maintenance.', 'March 21, 2027', '/res/imagens/keepers.png'],
        ['Kids Marine Science Day', 'Workshop', 'A fun, interactive workshop where children learn about marine biology through hands-on activities and experiments.', 'April 10, 2027', '/res/imagens/kidsscience.png'],
        ['Deep Sea Creatures Talk', 'Talk', 'An expert-led talk exploring the strange and fascinating animals that live in the deepest parts of the ocean.', 'May 15, 2027', '/res/imagens/deepsea.png']
      ]

      const stmt = `INSERT INTO events (title, event_type, description, event_date, image) VALUES (?, ?, ?, ?, ?)`

      sampleEvents.forEach(event => {
        db.run(stmt, event, (err) => {
          if (err) console.error(err)
        })
      })
    }
  })

  // table faqs
  db.run(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      image TEXT
    )
  `)

  db.get(`SELECT COUNT(*) AS count FROM faqs`, [], (err, row) => {
    if (err) {
      console.error(err)
      return
    }

    if (row.count === 0) {
      const sampleFaqs = [
        ['Is Aquarium World suitable for families?', 'Yes, our zones and exhibits are designed for visitors of all ages.', '/res/imagens/familyhugging.png'],
        ['Do you offer guided tours?', 'We run scheduled talks and guided walkthroughs throughout the day.', '/res/imagens/guia.png'],
        ['Is the aquarium accessible?', 'We provide step-free access, lifts, and clear signage. Staff are available to assist.', '/res/imagens/accessibility.png'],
        ['Can I bring food and drink?', 'Food and drink are only allowed in exhibit areas if purchased in our café, or for children under 2 years old', '/res/imagens/foodallowed.png'],
        ['Do you offer tickets online?', 'Yes, tickets can be booked in advance through our website to skip the queue on arrival.', '/res/imagens/tickets.png'],
        ['Is there parking available on site?', 'Yes, we have a car park located just outside the main entrance, with accessible bays close to the doors.', '/res/imagens/parking.png'],
        ['How long does a visit usually take?', "Most visitors spend between 2 and 3 hours exploring all of our zones, though you're welcome to stay all day.", '/res/imagens/clock.png'],
        ['Are pets allowed inside the aquarium?', 'For everyone safety, pets are not permitted, with the exception of registered assistance animals supporting visitors with disabilities.', '/res/imagens/petsnotallowed.png'],
        ['Is photography allowed during the visit?', 'Absolutely — we encourage you to take photos throughout your visit. Flash photography is discouraged near certain tanks to avoid disturbing the marine life.', '/res/imagens/photos.png'],
        ['Do you offer group or school discounts?', 'Yes, discounted rates are available for school trips and groups of 10 or more. Please contact us in advance to arrange your visit.', '/res/imagens/discount.png']
      ]

      const stmt = `INSERT INTO faqs (question, answer, image) VALUES (?, ?, ?)`

      sampleFaqs.forEach(faq => {
        db.run(stmt, faq, (err) => {
          if (err) console.error(err)
        })
      })
    }
  })

})

module.exports = db