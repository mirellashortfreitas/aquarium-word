const Database = require('better-sqlite3')
const db = new Database('aquarium.db')

db.exec(`
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

db.exec(`
  CREATE TABLE IF NOT EXISTS reactions (
    faq_id INTEGER PRIMARY KEY,
    likes INTEGER NOT NULL DEFAULT 0,
    hearts INTEGER NOT NULL DEFAULT 0
  )
`)

module.exports = db