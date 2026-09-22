/* =====================================================
   Swell Time Surf School – front-end logic
   -----------------------------------------------------
   This file has five jobs:
     1. Render the lesson and instructor cards from data.
     2. Show sample beach conditions.
     3. Handle the booking form (validate, price, save).
     4. Work out how many spots are left per lesson per day.
     5. Show / remove saved bookings from localStorage.
   ===================================================== */

// ---------- 1. Data ----------

const LESSONS = [
  {
    id: "beginner",
    icon: "🌊",
    name: "Beginner group",
    tag: "Most popular",
    price: 45,
    duration: "2 hours",
    capacity: 12,
    perks: ["Max 6 per coach", "Wetsuit & board included", "Stand up on day one"],
  },
  {
    id: "improver",
    icon: "🏄",
    name: "Improver group",
    tag: "Level up",
    price: 55,
    duration: "2 hours",
    capacity: 8,
    perks: ["Green-wave coaching", "Video feedback", "Max 4 per coach"],
  },
  {
    id: "private",
    icon: "⭐",
    name: "Private lesson",
    tag: "One to one",
    price: 95,
    duration: "90 minutes",
    capacity: 3,
    perks: ["Your own coach", "Tailored to your goals", "Any level welcome"],
  },
  {
    id: "kids",
    icon: "🐬",
    name: "Grom club (ages 7 to 12)",
    tag: "Kids",
    price: 35,
    duration: "90 minutes",
    capacity: 10,
    perks: ["Fun, safe & shallow", "Lifeguard on the beach", "Max 5 per coach"],
  },
];

const INSTRUCTORS = [
  { name: "Maya Reyes", role: "Head coach", bio: "Fifteen years teaching on this beach. Loves helping nervous first-timers relax.", colour: "#0b6e99" },
  { name: "Tom Okafor", role: "Improver specialist", bio: "Ex-competition surfer who is obsessed with clean bottom turns.", colour: "#ff7a45" },
  { name: "Sam Lindqvist", role: "Grom club lead", bio: "Primary school teacher in winter, surf coach in summer. Endless patience.", colour: "#2a9d8f" },
];

// Sample data only. A real app would fetch this from a weather or tide API.
const CONDITIONS = {
  waveHeightFt: 2.5,
  windMph: 8,
  windDirection: "offshore",
  waterTempC: 15,
  nextHighTide: "14:20",
};

const STORAGE_KEY = "swellTimeBookings";

// ---------- 2. Rendering helpers ----------

function renderLessons() {
  const grid = document.getElementById("lesson-grid");
  grid.innerHTML = LESSONS.map(
    (lesson) => `
      <article class="card">
        <div class="card-icon">${lesson.icon}</div>
        <span class="tag">${lesson.tag}</span>
        <h3>${lesson.name}</h3>
        <p class="price">£${lesson.price} <span>/ person · ${lesson.duration}</span></p>
        <ul>${lesson.perks.map((p) => `<li>${p}</li>`).join("")}</ul>
        <a href="#book" class="btn btn-ghost btn-small" data-lesson="${lesson.id}">Book this</a>
      </article>`
  ).join("");

  // Clicking "Book this" pre-selects that lesson in the form.
  grid.querySelectorAll("[data-lesson]").forEach((link) => {
    link.addEventListener("click", () => {
      document.getElementById("lesson").value = link.dataset.lesson;
      updatePrice();
      updateAvailability();
    });
  });
}

function renderInstructors() {
  const grid = document.getElementById("instructor-grid");
  grid.innerHTML = INSTRUCTORS.map((person) => {
    const initials = person.name
      .split(" ")
      .map((part) => part[0])
      .join("");
    return `
      <article class="card">
        <div class="avatar" style="background:${person.colour}">${initials}</div>
        <h3>${person.name}</h3>
        <span class="tag">${person.role}</span>
        <p class="muted">${person.bio}</p>
      </article>`;
  }).join("");
}

function renderConditions() {
  const c = CONDITIONS;
  document.getElementById("cond-wave").textContent = `${c.waveHeightFt} ft`;
  document.getElementById("cond-wind").textContent = `${c.windMph} mph ${c.windDirection}`;
  document.getElementById("cond-temp").textContent = `${c.waterTempC} °C`;
  document.getElementById("cond-tide").textContent = c.nextHighTide;

  // A simple rule of thumb for beginners: small clean waves and light wind.
  let verdict = "🟡 Decent conditions. Improvers will enjoy it.";
  if (c.waveHeightFt <= 3 && c.windMph <= 10 && c.windDirection === "offshore") {
    verdict = "🟢 Perfect for beginners today. Clean, gentle waves.";
  } else if (c.waveHeightFt > 5 || c.windMph > 20) {
    verdict = "🔴 Too big for lessons today. Call us before you travel.";
  }
  document.getElementById("cond-verdict").textContent = verdict;
}

function populateLessonSelect() {
  const select = document.getElementById("lesson");
  select.innerHTML = LESSONS.map(
    (lesson) => `<option value="${lesson.id}">${lesson.name} – £${lesson.price}</option>`
  ).join("");
}

// ---------- 3. Booking form ----------

function getLessonById(id) {
  return LESSONS.find((lesson) => lesson.id === id);
}

function updatePrice() {
  const lesson = getLessonById(document.getElementById("lesson").value);
  const people = parseInt(document.getElementById("people").value, 10) || 0;
  const total = lesson ? lesson.price * people : 0;
  document.getElementById("price-total").textContent = `£${total}`;
}

function showError(message, field) {
  const box = document.getElementById("form-error");
  box.textContent = message;
  box.hidden = false;
  box.className = "form-error";
  if (field) {
    field.classList.add("invalid");
    field.focus();
  }
}

function showSuccess(message) {
  const box = document.getElementById("form-error");
  box.textContent = message;
  box.hidden = false;
  box.className = "form-success";
}

function clearFieldErrors(form) {
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
}

function validateBooking(form) {
  clearFieldErrors(form);

  const name = form.name.value.trim();
  if (name.length < 2) {
    showError("Please tell us your name.", form.name);
    return null;
  }

  const email = form.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("That email address doesn't look right.", form.email);
    return null;
  }

  const date = form.date.value;
  const today = new Date().toISOString().slice(0, 10);
  if (!date) {
    showError("Pick a date for your lesson.", form.date);
    return null;
  }
  if (date < today) {
    showError("That date has already passed. Pick a future date.", form.date);
    return null;
  }

  const people = parseInt(form.people.value, 10);
  if (!people || people < 1 || people > 8) {
    showError("We can take between 1 and 8 surfers per booking.", form.people);
    return null;
  }

  const lesson = getLessonById(form.lesson.value);

  // Capacity check comes last so `people` is already a sane number.
  const left = spotsLeft(lesson.id, date);
  if (people > left) {
    const when = formatDate(date);
    showError(
      left === 0
        ? `${lesson.name} is fully booked on ${when}. Try another day.`
        : `Only ${left} spot${left === 1 ? "" : "s"} left for ${lesson.name} on ${when}.`,
      form.people
    );
    return null;
  }

  return {
    id: Date.now(),
    name,
    email,
    lessonId: lesson.id,
    lessonName: lesson.name,
    date,
    people,
    level: form.level.value,
    total: lesson.price * people,
  };
}

// ---------- 4. Availability ----------
// Spots left are *derived* from the saved bookings every time we need them,
// rather than stored as a separate counter. That way cancelling a booking
// automatically frees its spots and nothing can drift out of sync.

function bookedCount(lessonId, date) {
  return loadBookings()
    .filter((b) => b.lessonId === lessonId && b.date === date)
    .reduce((sum, b) => sum + b.people, 0);
}

function spotsLeft(lessonId, date) {
  const lesson = getLessonById(lessonId);
  if (!lesson) return 0;
  return Math.max(0, lesson.capacity - bookedCount(lessonId, date));
}

function updateAvailability() {
  const box = document.getElementById("availability");
  const lessonId = document.getElementById("lesson").value;
  const date = document.getElementById("date").value;
  const lesson = getLessonById(lessonId);

  box.classList.remove("is-low", "is-full");

  if (!lesson || !date) {
    box.textContent = "Pick a date to see how many spots are left.";
    return;
  }

  const left = spotsLeft(lessonId, date);
  const when = formatDate(date);

  if (left === 0) {
    box.textContent = `Fully booked on ${when}. Try another day.`;
    box.classList.add("is-full");
  } else if (left <= 3 && left < lesson.capacity) {
    // Urgent wording only once someone has actually taken a spot.
    box.textContent = `Only ${left} of ${lesson.capacity} spots left on ${when}. Be quick!`;
    box.classList.add("is-low");
  } else {
    box.textContent = `${left} of ${lesson.capacity} spots left on ${when}.`;
  }
}

// ---------- 5. Saved bookings (localStorage) ----------

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Storage can be unavailable (private mode). The page still works without it.
  }
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function renderBookings() {
  const bookings = loadBookings();
  const list = document.getElementById("bookings-list");
  const empty = document.getElementById("bookings-empty");
  const clearBtn = document.getElementById("clear-bookings");

  list.innerHTML = bookings
    .map(
      (b) => `
      <li class="booking-item">
        <div>
          <strong>${escapeHtml(b.lessonName)}</strong>
          <span class="muted">${formatDate(b.date)} · ${b.people} surfer${b.people > 1 ? "s" : ""} · £${b.total}</span>
        </div>
        <button class="booking-remove" data-id="${b.id}" aria-label="Cancel booking">✕</button>
      </li>`
    )
    .join("");

  empty.hidden = bookings.length > 0;
  clearBtn.hidden = bookings.length === 0;

  list.querySelectorAll(".booking-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const remaining = loadBookings().filter((b) => String(b.id) !== btn.dataset.id);
      saveBookings(remaining);
      renderBookings();
      updateAvailability();
    });
  });
}

// Prevents user-typed text from being treated as HTML when we put it on the page.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- 6. Wire everything up ----------

function init() {
  renderLessons();
  renderInstructors();
  renderConditions();
  populateLessonSelect();
  renderBookings();
  updatePrice();
  updateAvailability();

  document.getElementById("year").textContent = new Date().getFullYear();

  // Don't allow booking dates in the past.
  document.getElementById("date").min = new Date().toISOString().slice(0, 10);

  const form = document.getElementById("booking-form");
  form.lesson.addEventListener("change", () => {
    updatePrice();
    updateAvailability();
  });
  form.people.addEventListener("input", updatePrice);
  form.date.addEventListener("change", updateAvailability);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const booking = validateBooking(form);
    if (!booking) return;

    saveBookings([...loadBookings(), booking]);
    renderBookings();
    showSuccess(`You're in, ${booking.name.split(" ")[0]}! ${booking.lessonName} on ${formatDate(booking.date)}.`);
    form.reset();
    form.people.value = 1;
    updatePrice();
    updateAvailability();
  });

  document.getElementById("clear-bookings").addEventListener("click", () => {
    saveBookings([]);
    renderBookings();
    updateAvailability();
  });
}

document.addEventListener("DOMContentLoaded", init);
