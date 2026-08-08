console.log("JavaScript is working!");

/*Popup (photo gallery) */
function openPopup(src, description) {
  const popup = document.getElementById("popup");
  const popupImage = document.getElementById("popup-image");
  const popupText = document.getElementById("popup-description");

  popupImage.src = src;
  popupText.textContent = description;
  popup.style.display = "flex";
}

function closePopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "none";
}

/* Wire up gallery images + popup close controls.
   Done here (instead of inline onclick="") because helmet's default
   Content-Security-Policy sets script-src-attr 'none', which silently
   blocks inline event handler attributes like onclick/onkeydown. */
document.querySelectorAll(".foto-galeria").forEach(img => {
  const trigger = () => openPopup(img.src, img.dataset.desc);

  img.addEventListener("click", trigger);
  img.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      trigger();
    }
  });
});

const popupOverlay = document.getElementById("popup");
const popupBox = document.querySelector(".popup-box");
const popupCloseBtn = document.querySelector(".popup-close");

if (popupOverlay) {
  popupOverlay.addEventListener("click", closePopup);
}

if (popupBox) {
  popupBox.addEventListener("click", (event) => event.stopPropagation());
}

if (popupCloseBtn) {
  popupCloseBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    closePopup();
  });
}

/*updateLiveTime*/

async function updateLiveTime() {
  try {
    const response = await fetch('/server-time');
    const data = await response.json();
    const el = document.getElementById('live-time');
    if (el) {
      el.textContent = `— Current time: ${data.time}`;
    }
  } catch (error) {
    console.error('Failed to fetch server time:', error);
  }
}

updateLiveTime(); /*updatepage* every one second*/
setInterval(updateLiveTime, 1000);
/* FAQ - Reactions (likes and hearts) */

console.log('Like buttons found:', document.querySelectorAll('.like-btn').length);
console.log('Heart buttons found:', document.querySelectorAll('.heart-btn').length);

document.querySelectorAll('.like-btn').forEach(button => {
  button.addEventListener('click', () => handleReaction(button, 'like', 'likes'));
});

document.querySelectorAll('.heart-btn').forEach(button => {
  button.addEventListener('click', () => handleReaction(button, 'heart', 'hearts'));
});

async function handleReaction(button, type, counterClass) {
  const faqBox = button.closest('.faq-box');
  const faqId = faqBox.dataset.faqId;
  const counter = button.querySelector(`.${counterClass}`);

  // avoid duplicate clicks while waiting for the server response
  button.disabled = true;

  try {
    const response = await fetch('/reactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ faqId, type })
    });

    if (response.ok) {
      const data = await response.json();
      counter.textContent = data.count; // server returns the updated total
    } else {
      console.error('Failed to save reaction');
    }

  } catch (error) {
    console.error('Network error:', error);
  } finally {
    button.disabled = false;
  }
}

/* load saved like/heart counts when the FAQ page opens */
async function loadReactions() {
  try {
    const response = await fetch('/reactions');
    if (!response.ok) return;

    const rows = await response.json();

    rows.forEach(row => {
      const faqBox = document.querySelector(`.faq-box[data-faq-id="${row.faq_id}"]`);
      if (!faqBox) return;

      const likesCounter = faqBox.querySelector('.likes');
      const heartsCounter = faqBox.querySelector('.hearts');

      if (likesCounter) likesCounter.textContent = row.likes;
      if (heartsCounter) heartsCounter.textContent = row.hearts;
    });

  } catch (error) {
    console.error('Failed to load reactions:', error);
  }
}

loadReactions();

/* PAGE CONTACT US - Form Validation + AJAX submit */

const form = document.getElementById('contactForm')

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const name = document.getElementById('name')
    const email = document.getElementById('email')
    const subject = document.getElementById('subject')
    const message = document.getElementById('message')

    let hasError = false

    document.querySelectorAll('.error-message').forEach(el => el.remove())
    const oldSuccess = document.querySelector('.success-message')
    if (oldSuccess) oldSuccess.remove()

    if (name.value.trim() === '') {
      showError(name, 'Please fill in your name.')
      hasError = true
    }

    if (email.value.trim() === '') {
      showError(email, 'Please fill in your email.')
      hasError = true
    }

    if (subject.value.trim() === '') {
      showError(subject, 'Please write a message.')
      hasError = true
    }

    if (message.value.trim() === '') {
      showError(message, 'Please write a message.')
      hasError = true
    }

    if (hasError) {
      return
    }

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          subject: subject.value.trim(),
          message: message.value.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        form.reset()
        showSuccess(form, data.message)
      } else {
        showError(message, data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      showError(message, 'Network error. Please try again.')
    }
  })
}

function showError(input, text) {
  const errorEl = document.createElement('p')
  errorEl.className = 'error-message'
  errorEl.textContent = text
  errorEl.style.color = 'red'
  input.insertAdjacentElement('afterend', errorEl)
}

function showSuccess(form, text) {
  const successEl = document.createElement('p')
  successEl.className = 'success-message'
  successEl.textContent = text
  successEl.style.color = 'green'
  form.insertAdjacentElement('beforeend', successEl)

  setTimeout(() => successEl.remove(), 4000)
}

/*fetch event AJAX*/

const searchInput = document.getElementById('event-search')
const eventsList = document.getElementById('events-list')

if (searchInput && eventsList) {
  searchInput.addEventListener('input', async () => {
    const query = searchInput.value

    try {
      const response = await fetch(`/api/events/search?q=${encodeURIComponent(query)}`)
      const events = await response.json()

      if (events.length === 0) {
        eventsList.innerHTML = '<p>No events found.</p>'
        return
      }

      eventsList.innerHTML = events.map(ev => `
        <div class="event-card">
          <h2>${ev.title}</h2>
          <p><em>${ev.event_type}</em> — ${ev.event_date}</p>
          <p>${ev.description}</p>
        </div>
      `).join('')

    } catch (err) {
      console.error('Search error:', err)
    }
  })
}

/* Site-wide search (magnifying glass icon in the header) */

const searchToggle = document.getElementById('search-toggle')
const siteSearchInput = document.getElementById('site-search-input')
const siteSearchResults = document.getElementById('site-search-results')

if (searchToggle && siteSearchInput && siteSearchResults) {

  searchToggle.addEventListener('click', () => {
    siteSearchInput.classList.toggle('active')
    if (siteSearchInput.classList.contains('active')) {
      siteSearchInput.focus()
    } else {
      siteSearchResults.innerHTML = ''
      siteSearchResults.classList.remove('active')
    }
  })

  let debounceTimer

  siteSearchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    const query = siteSearchInput.value.trim()

    if (query === '') {
      siteSearchResults.innerHTML = ''
      siteSearchResults.classList.remove('active')
      return
    }

    debounceTimer = setTimeout(() => runSiteSearch(query), 300)
  })

  document.addEventListener('click', (event) => {
    const clickedInsideSearch = event.target.closest('.site-search')
    if (!clickedInsideSearch) {
      siteSearchResults.innerHTML = ''
      siteSearchResults.classList.remove('active')
    }
  })
}

async function runSiteSearch(query) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const results = await response.json()

    if (results.length === 0) {
      siteSearchResults.innerHTML = '<p class="no-results">No results found.</p>'
      siteSearchResults.classList.add('active')
      return
    }

    siteSearchResults.innerHTML = results.map(item => `
      <a class="search-result" href="${item.url}">
        <span class="search-result-type">${item.type}</span>
        <span class="search-result-title">${item.title}</span>
        <span class="search-result-snippet">${item.snippet}</span>
      </a>
    `).join('')

    siteSearchResults.classList.add('active')
  } catch (error) {
    console.error('Site search error:', error)
  }
}

/* Countdown badge*/

function updateCountdowns() {
  document.querySelectorAll('.countdown-badge').forEach(badge => {
    
    const rawDate = badge.dataset.date.split(/[–-]/)[0].trim()
    const eventDate = new Date(rawDate)

    if (isNaN(eventDate)) return // data que o JS não consegue interpretar

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))

    if (diffDays > 1) {
      badge.textContent = `⏳ ${diffDays} days to go`
    } else if (diffDays === 1) {
      badge.textContent = `⏳ 1 day to go`
    } else if (diffDays === 0) {
      badge.textContent = `🎉 Happening today!`
    } else {
      badge.textContent = `Event ended`
      badge.classList.add('past')
    }
  })
}


updateCountdowns();

/* Event card share & print buttons */

document.querySelectorAll(".btn-share").forEach(btn => {
  btn.addEventListener("click", async () => {
    const title = btn.dataset.title;
    const url = `${location.origin}/events`;
    const shareData = {
      title: `Aquarium World – ${title}`,
      text: `Check out this event at Aquarium World: ${title}`,
      url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled the share sheet — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        const original = btn.textContent;
        btn.textContent = "Link copied!";
        setTimeout(() => { btn.textContent = original; }, 2000);
      } catch (err) {
        console.error("Could not copy link:", err);
      }
    }
  });
});

document.querySelectorAll(".btn-print").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".event-card");
    card.classList.add("print-only");
    window.print();
  });
});

window.addEventListener("afterprint", () => {
  document.querySelectorAll(".print-only").forEach(el => el.classList.remove("print-only"));
});

/* Floating "Buy Tickets" button + upcoming events popup */

const ticketFloatBtn = document.getElementById("ticket-float-btn");
const ticketPopup = document.getElementById("ticket-popup");
const ticketPopupClose = document.getElementById("ticket-popup-close");
const ticketEventList = document.getElementById("ticket-event-list");

function openTicketPopup() {
  ticketPopup.style.display = "flex";
  loadTicketEvents();
}

function closeTicketPopup() {
  ticketPopup.style.display = "none";
}

if (ticketFloatBtn && ticketPopup) {
  ticketFloatBtn.addEventListener("click", openTicketPopup);

  ticketPopup.addEventListener("click", closeTicketPopup);

  const ticketPopupBox = ticketPopup.querySelector(".popup-box");
  if (ticketPopupBox) {
    ticketPopupBox.addEventListener("click", (event) => event.stopPropagation());
  }

  if (ticketPopupClose) {
    ticketPopupClose.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTicketPopup();
    });
  }
}

async function loadTicketEvents() {
  if (!ticketEventList) return;
  ticketEventList.innerHTML = "<li>Loading events...</li>";

  try {
    const response = await fetch("/api/events/search?q=");
    const events = await response.json();

    if (events.length === 0) {
      ticketEventList.innerHTML = "<li>No events currently scheduled.</li>";
      return;
    }

    ticketEventList.innerHTML = events.map(ev => `
      <li>
        <span class="ticket-event-title">${ev.title}</span>
        <span class="ticket-event-date">${ev.event_date}</span>
      </li>
    `).join("");
  } catch (error) {
    console.error("Failed to load events for ticket popup:", error);
    ticketEventList.innerHTML = "<li>Could not load events. Please try again.</li>";
  }
}

