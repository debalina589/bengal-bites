const mobileMenu = document.getElementById('mainNavbar');

mobileMenu?.querySelectorAll('.nav-link').forEach(link =>{
    link.addEventListener('click', function(){
        if (window.innerWidth < 992 && window.bootstrap) {
            bootstrap.Collapse.getOrCreateInstance(
                mobileMenu,
                { toggle: false }
            ).hide();
        }
    });
});

const galleryModal = document.getElementById('galleryModal');
const galleryPreview = document.getElementById('galleryPreview');
const galleryModalTitle = document.getElementById('galleryModalTitle');

galleryModal?.addEventListener('show.bs.modal', function (event) {
  const selectedImage = event.relatedTarget?.querySelector('img');

  if (!selectedImage || !galleryPreview) return;

  galleryPreview.src = selectedImage.src;
  galleryPreview.alt = selectedImage.alt;

  if (galleryModalTitle) {
    galleryModalTitle.textContent = selectedImage.alt;
  }
});

const contactForm = document.getElementById('contactForm');

if(contactForm){
const nameField = document.getElementById('contactName');
const emailField = document.getElementById('contactEmail');
const messageField = document.getElementById('contactMessage');
const dateField = document.getElementById('bookingDate');
const timeeField = document.getElementById('bookingTime');
const guestsField = document.getElementById('bookingGuests');
const status = document.getElementById('formStatus');

function updateBookingLimits(){
  dateField.min = getKolkataNow().date;

  const chosenDate = new Date(`${dateField.value}T00:00:00Z`);
  const day = chosenDate.getUTCDay();
  const weekend = day === 0 || day === 6;

  timeeField.min = weekend ? '11:00' : '12:00';
  timeeField.max = weekend ? '22:45' : '21:45';
}

function markField(field, valid){
  field.classList.toggle('is-invalid', !valid);
  field.setAttribute('aria-invalid', String(!valid));
}

dateField.addEventListener('change', updateBookingLimits);
updateBookingLimits();

contactForm.addEventListener('submit', function(event){
  event.preventDefault();
  updateBookingLimits();

const now = getKolkataNow();  
const name = contactName.value.trim();
const email = contactEmail.value.trim();
const message = contactMessage.value.trim();

emailField.value = email;

const dateValid = 
  dateField.value !== '' &&
  dateField.validity.valid && 
  dateField.value >= now.date;
const timeValid = 
dateValid && 
  timeeField.value !== '' &&
  timeeField.validity.valid && 
  (
    dateField.value > now.date || 
    timeeField.value > now.time
  );

  const guests = Number(guestsField.value);

  const results = [
    [nameField, name.length >= 2 && name.length <= 60],
    [
      emailField,
      email.length > 0 &&
      email.length <= 120 &&
      emailField.validity.valid,
    ],
    [dateField, dateValid],
    [timeeField, timeValid],
    [
      guestsField,
      guestsField.value !== '' &&
      Number.isInteger(guests) &&
      guests >= 1 &&
      guests <= 12,
    ],
    [
      messageField,
      message.length >= 10 && message.length <= 1000,
    ],
  ];

  results.forEach(([field, valid]) => markField(field, valid));

  const firstInvalid = results.find(([, valid]) => !valid);

if (firstInvalid) {
    status.className ='mt-3 mb-0 text-danger';
    status.textContent = 'Please complete all required fields correctly.';

    firstInvalid[0].focus();
    return;
}

status.textContent = 'Demo validation successful. No enquiry has been sent and no reservation has been made.';

status.className = 'mt-3 mb-0 text-success';

});

contactForm.addEventListener('input', function(event){
    const field = event.target;
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');

    status.textContent = '';
});
}




// ---------- Theme ----------

const themeToggle = document.getElementById('themeToggle');

function updateThemeButton() {
  if (!themeToggle) return;

  const isDark =
    document.documentElement.dataset.bsTheme === 'dark';

  themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

themeToggle?.addEventListener('click', function () {
  const nextTheme =
    document.documentElement.dataset.bsTheme === 'dark'
      ? 'light'
      : 'dark';

  document.documentElement.dataset.bsTheme = nextTheme;

  try {
    localStorage.setItem('bengal-bites-theme', nextTheme);
  } catch {
    // Theme changes still work for this visit.
  }

  updateThemeButton();
});

updateThemeButton();

// ---------- Kolkata date and time ----------

function getKolkataNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

// ---------- Today's Special ----------

function updateSpecials() {
  const today = getKolkataNow().date;
  const day = new Date(`${today}T00:00:00Z`).getUTCDay();

  document.querySelectorAll('[data-special-days]').forEach(badge => {
    const days = badge.dataset.specialDays
      .split(',')
      .map(value => Number(value.trim()));

    badge.hidden = !days.includes(day);
  });
}

updateSpecials();

// Also updates if someone leaves the page open overnight.
setInterval(updateSpecials, 60000);




// ---------- Footer ----------

const footerYear = document.getElementById('footerYear');

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}


// document.getElementById('footerYear').textContent = new Date().getFullYear();

// const sectionLinks = [...document.querySelectorAll('#mainNavbar .nav-link[href^="#"]')];

// const linkedSections = sectionLinks.map(function(link){
//     return document.getElementById(link.getAttribute('href').slice(1));
// })
// .filter(Boolean);


// ---------- Active navigation ----------

const pageNavbar = document.querySelector('nav.navbar');

const navigationItems = [
  ...document.querySelectorAll('#mainNavbar .nav-link[href^="#"]'),
]
  .map(link => ({
    link,
    section: document.getElementById(
      link.getAttribute('href').slice(1)
    ),
  }))
  .filter(item => item.section);

// Use actual page order, even if navbar links are ordered differently.
navigationItems.sort((a, b) => {
  if (a.section === b.section) return 0;

  return a.section.compareDocumentPosition(b.section) &
    Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
});

function updateActiveLink() {
  if (!pageNavbar || navigationItems.length === 0) return;

  const readingLine = pageNavbar.getBoundingClientRect().bottom + 24;
  let current = navigationItems[0];

  navigationItems.forEach(item => {
    if (item.section.getBoundingClientRect().top <= readingLine) {
      current = item;
    }
  });

  const atBottom =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 2;

  if (atBottom) {
    current = navigationItems[navigationItems.length - 1];
  }

  navigationItems.forEach(item => {
    const active = item.section === current.section;

    item.link.classList.toggle('active', active);

    if (active) {
      item.link.setAttribute('aria-current', 'location');
    } else {
      item.link.removeAttribute('aria-current');
    }
  });
}

let updatePending = false;

window.addEventListener('scroll', function () {
  if (updatePending) return;

  updatePending = true;

  requestAnimationFrame(function () {
    updatePending = false;
    updateActiveLink();
  });
}, { passive: true });

window.addEventListener('resize', updateActiveLink);
window.addEventListener('load', updateActiveLink);

updateActiveLink();