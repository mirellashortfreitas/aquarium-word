
main.js
10.25 KB •357 lines
Formatting may be inconsistent from source
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
