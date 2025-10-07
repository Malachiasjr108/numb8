
// Countdown and Echo unlock script

const countdownElement = document.getElementById("countdown");
const rings = document.querySelectorAll(".nft-ring-portal.locked");

let unlockBatch = 111;
let unlockInterval = 2 * 60 * 1000; // 2 minutes for demo, use 8*24*60*60*1000 for 8 days
let nextUnlockTime = Date.now() + unlockInterval;

function updateCountdown() {
  let now = Date.now();
  let distance = nextUnlockTime - now;

  if (distance <= 0) {
    unlockNextBatch();
    nextUnlockTime = Date.now() + unlockInterval;
    distance = nextUnlockTime - now;
  }

  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((distance % (1000 * 60)) / 1000);

  countdownElement.innerHTML = `${days} DAYS : ${hours} HOURS : ${minutes} MIN : ${seconds} SEC`;
}

function unlockNextBatch() {
  let unlocked = 0;
  for (let i = 0; i < rings.length; i++) {
    if (rings[i].classList.contains("locked")) {
      rings[i].classList.remove("locked");
      rings[i].classList.add("unlocked");
      unlocked++;
      if (unlocked >= unlockBatch) break;
    }
  }
}

setInterval(updateCountdown, 1000);
