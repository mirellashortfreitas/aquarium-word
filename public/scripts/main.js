console.log("JavaScript is working!");

/* ---------- Popup (photo gallery) ---------- */

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

/* ---------- Reactions (likes and hearts) ---------- */

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