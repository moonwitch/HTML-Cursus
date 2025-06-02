const CAROUSEL_IMG = document.querySelector("#carousel__first-img");
const CAROUSEL = document.querySelector(".carousel");
const BULLETS = document.querySelectorAll(".carousel__bullet");
const NUM_IMAGES = document.querySelectorAll(".carousel__img").length;

let marginLeft = 0;
let autoSlideInterval;
let currentIndex = 0;

function goToSlide(index) {
  clearInterval(autoSlideInterval);
  currentIndex = index;
  marginLeft = -index * 100;
  CAROUSEL_IMG.style.marginLeft = marginLeft + "%";
  startAutoSlide();
  updateActiveBullet();
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % NUM_IMAGES;
  goToSlide(currentIndex);
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + NUM_IMAGES) % NUM_IMAGES;
  goToSlide(currentIndex);
}

// Function to highlight the active bullet
function updateActiveBullet() {
  BULLETS.forEach((bullet) =>
    bullet.classList.remove("carousel__bullet--active"),
  );
  BULLETS[currentIndex].classList.add("carousel__bullet--active");
}

function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 5000);
}

// Initialize the carousel
startAutoSlide();
updateActiveBullet();
