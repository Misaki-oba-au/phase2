const STORAGE_KEY = "cultural-events-selection";

const countryFilters = document.getElementById("country-filters");
const todayTitle = document.getElementById("today-title");
const todaySummary = document.getElementById("today-summary");
const todayEvents = document.getElementById("today-events");
const calendarMonth = document.getElementById("calendar-month");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const calendarGrid = document.getElementById("calendar-grid");
const selectedDateTitle = document.getElementById("selected-date-title");
const selectedDayEvents = document.getElementById("selected-day-events");
const comingUpList = document.getElementById("coming-up-list");
const comingUpNote = document.getElementById("coming-up-note");

const countries = [
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
];

const countryLookup = Object.fromEntries(countries.map((country) => [country.code, country]));

const events = [
  {
    id: "songkran",
    name: "Songkran",
    countries: ["TH"],
    region: "All regions",
    month: 4,
    day: 13,
    type: "Water Festival & New Year",
    significance: "An important celebration of Thai New Year that symbolizes family and community connections.",
    celebration: "People splash water on each other in the streets, visit temples for prayer, and spend time with family.",
    foods: ["Thai sweets", "Light meals", "Fruits"],
    attire: "Bright, lightweight clothing",
    colors: ["Blue", "Red", "Yellow"],
    culturalNotes: "It's important to respect people's feelings and avoid splashing water in quiet areas.",
    businessTips: "Customers are more likely to be out during this time, so starting with a warm greeting and brief conversation helps build rapport.",
    priority: 3,
  },
  {
    id: "loy-krathong",
    name: "Loy Krathong",
    countries: ["TH"],
    region: "All regions",
    month: 11,
    day: 15,
    type: "Lantern & Moon Festival",
    significance: "A traditional festival expressing gratitude and purification of the spirit.",
    celebration: "Small decorated boats with lit candles are floated on water, while temples and families gather to celebrate.",
    foods: ["Thai cuisine", "Rice dishes", "Desserts"],
    attire: "Muted, calm-colored clothing",
    colors: ["Yellow", "White", "Gold"],
    culturalNotes: "In areas near water or rivers, it's important to maintain a quiet and respectful atmosphere.",
    businessTips: "A slower, more reflective communication style is appreciated, so patience and attentiveness are valued.",
    priority: 2,
  },
  {
    id: "independence-day",
    name: "Independence Day",
    countries: ["US"],
    region: "All regions",
    month: 7,
    day: 4,
    type: "National Holiday",
    significance: "An important day celebrating American independence.",
    celebration: "Fireworks, parades, and family gatherings are typical ways to celebrate.",
    foods: ["Barbecue", "Pie", "Hot dogs"],
    attire: "Casual, with colors inspired by the flag",
    colors: ["Red", "White", "Blue"],
    culturalNotes: "Some customers may be sensitive to loud noises or crowds, so providing a quiet space is appreciated.",
    businessTips: "Since family and friends time is valued, listening patiently makes a good impression.",
    priority: 3,
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving",
    countries: ["US"],
    region: "All regions",
    month: 11,
    day: 27,
    type: "Thanksgiving Holiday",
    significance: "A family-centered holiday focused on sharing gratitude.",
    celebration: "Families gather around a feast and exchange messages of thanks.",
    foods: ["Turkey", "Pie", "Side dishes"],
    attire: "Casual, family-friendly clothing",
    colors: ["Orange", "Brown", "Yellow"],
    culturalNotes: "Customers value their time with family and friends, so avoid rushing long meals.",
    businessTips: "Short and courteous service is appreciated, as family time is a priority.",
    priority: 2,
  },
  {
    id: "holi",
    name: "Holi",
    countries: ["IN"],
    region: "All regions",
    month: 3,
    day: 14,
    type: "Festival of Colors",
    significance: "An important festival celebrating the arrival of spring and new beginnings.",
    celebration: "People spray colored powder and water on each other, and enjoy music and dancing.",
    foods: ["Savarna", "Gujhiya", "Sweet treats"],
    attire: "Colorful, lightweight clothing",
    colors: ["Red", "Yellow", "Green"],
    culturalNotes: "Since colors will stain clothing and objects, it's good to mention this so customers feel comfortable.",
    businessTips: "Customers are expressing warmth and hospitality, so a bright greeting and gentle tone are effective.",
    priority: 3,
  },
  {
    id: "diwali",
    name: "Diwali",
    countries: ["IN"],
    region: "All regions",
    month: 10,
    day: 31,
    type: "Festival of Lights",
    significance: "India's most important festival, celebrating the victory of good over evil and family bonds.",
    celebration: "Homes are lit with lamps and fireworks, and families gather to celebrate.",
    foods: ["Milk sweets", "Snacks", "Desserts"],
    attire: "New, vibrant clothing",
    colors: ["Gold", "Orange", "Red"],
    culturalNotes: "This is primarily a family-centered time, so showing consideration during busy periods is appreciated.",
    businessTips: "Short, polite service works well since customers prioritize family time.",
    priority: 3,
  },
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    countries: ["IN"],
    region: "Northern India",
    month: 8,
    day: 19,
    type: "Festival Celebrating Sibling Bonds",
    significance: "An important family occasion that strengthens the bond between siblings and celebrates protection.",
    celebration: "Sisters tie a sacred thread around brothers' wrists and exchange gifts.",
    foods: ["Sugar sweets", "Snacks", "Tea"],
    attire: "Traditional Indian clothing",
    colors: ["Red", "Yellow", "Gold"],
    culturalNotes: "Family relationships are valued on this day, so respecting family topics is important.",
    businessTips: "Treating this as a family-centered occasion and avoiding aggressive sales approaches is key.",
    priority: 2,
  },
  {
    id: "visakha-bucha",
    name: "Visakha Bucha",
    countries: ["TH"],
    region: "All regions",
    month: 5,
    day: 22,
    type: "Buddhist Festival",
    significance: "An important Buddhist occasion in Thailand that celebrates Buddha's birth, enlightenment, and passing.",
    celebration: "People visit temples holding candles and practice meditation in honor of Buddha.",
    foods: ["Light meals", "Fruits", "Buddhist-friendly sweets"],
    attire: "Calm-colored, modest clothing",
    colors: ["White", "Gold", "Yellow"],
    culturalNotes: "This is a religious occasion requiring quiet and respectful behavior.",
    businessTips: "A calm and courteous approach is effective on this solemn day.",
    priority: 3,
  },
  {
    id: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    countries: ["IN"],
    region: "All regions",
    month: 9,
    day: 10,
    type: "Hindu Festival",
    significance: "An important festival honoring Ganesh, the god of wisdom and good fortune.",
    celebration: "Ganesh statues are placed in homes and temples, with prayers and sweets offered.",
    foods: ["Modak", "Sweet snacks", "Fruits"],
    attire: "Traditional, calm-colored clothing",
    colors: ["Yellow", "Red", "Orange"],
    culturalNotes: "Showing respect for religious observances through careful communication is important.",
    businessTips: "Respectful service that considers the customer's faith builds trust.",
    priority: 3,
  },
  {
    id: "new-years-day-us",
    name: "New Year's Day",
    countries: ["US"],
    region: "All regions",
    month: 1,
    day: 1,
    type: "National Holiday",
    significance: "An important holiday marking the start of the new year in America.",
    celebration: "Families and friends gather, with fireworks and parades in some places.",
    foods: ["Pancakes", "Champagne", "Light snacks"],
    attire: "Casual, comfortable clothing",
    colors: ["White", "Gold", "Blue"],
    culturalNotes: "New Year's blessings and good health are appreciated themes.",
    businessTips: "A bright greeting and warm wishes make a good impression.",
    priority: 2,
  },
  {
    id: "cinco-de-mayo",
    name: "Cinco de Mayo",
    countries: ["US"],
    region: "Some regions",
    month: 5,
    day: 5,
    type: "Cultural Celebration",
    significance: "Primarily celebrated by Mexican-American communities in the US, reflecting cultural diversity.",
    celebration: "Mexican food, music, and dancing are enjoyed to celebrate the occasion.",
    foods: ["Tacos", "Guacamole", "Margaritas"],
    attire: "Colorful clothing",
    colors: ["Green", "White", "Red"],
    culturalNotes: "Treat this as a cultural rather than religious celebration.",
    businessTips: "A lively, social approach is effective during this festive celebration.",
    priority: 2,
  },
  {
    id: "halloween",
    name: "Halloween",
    countries: ["US"],
    region: "All regions",
    month: 10,
    day: 31,
    type: "Cultural Event",
    significance: "A fall celebration where families and friends enjoy costumes and sweets.",
    celebration: "Costume parties, trick-or-treating, and pumpkin carving are popular activities.",
    foods: ["Candy", "Pumpkin pie", "Hot drinks"],
    attire: "Costumes or Halloween-themed clothing",
    colors: ["Orange", "Black", "Purple"],
    culturalNotes: "Many children are out during this time, so safety considerations are important.",
    businessTips: "Sharing in the fun while maintaining a calm presence provides comfort.",
    priority: 2,
  },
  {
    id: "hatsumode",
    name: "Hatsumode",
    countries: ["JP"],
    region: "All regions",
    month: 1,
    day: 2,
    type: "Temple/Shrine Visit",
    significance: "A traditional Japanese custom of visiting a shrine or temple on New Year's to pray for safety.",
    celebration: "People visit temples and shrines, receive fortunes, and purchase protective amulets.",
    foods: ["Ozoni soup", "Street vendor food", "Sweet sake"],
    attire: "Warm, neat clothing",
    colors: ["White", "Red", "Deep green"],
    culturalNotes: "Respectful behavior is important in religious spaces.",
    businessTips: "Polite New Year's greetings leave a positive impression.",
    priority: 2,
  },
  {
    id: "new-year",
    name: "New Year's Day",
    countries: ["JP"],
    region: "All regions",
    month: 1,
    day: 1,
    type: "National Holiday",
    significance: "Japan's most important celebration, marking the start of the year.",
    celebration: "Family and relatives gather for New Year's greetings and celebrations.",
    foods: ["Osechi", "Ozoni soup", "Mochi"],
    attire: "Calm, formal winter clothing",
    colors: ["Red", "White", "Gold"],
    culturalNotes: "This is a busy season, so showing patience and offering polite greetings is important.",
    businessTips: "Thoughtful New Year's greetings can enhance customer trust.",
    conversationTip: "Offer sincere New Year's greetings and maintain a calm approach.",
    customerInsight: "Demand for New Year gifts and holiday products is high.",
    priority: 2,
  },
  {
    id: "coming-of-age",
    name: "Coming of Age Day",
    countries: ["JP"],
    region: "All regions",
    month: 1,
    day: 14,
    type: "National Holiday",
    significance: "A traditional Japanese milestone celebrating young adults.",
    celebration: "Coming of age ceremonies, family dinners, and photo sessions are common.",
    foods: ["Osechi", "Cake", "Wagashi sweets"],
    attire: "Formal or traditional festive clothing",
    colors: ["White", "Red", "Navy"],
    culturalNotes: "This is a joyful family milestone, so a celebratory tone is appreciated.",
    businessTips: "Natural congratulations create a warm and approachable impression.",
    conversationTip: "Offer celebratory wishes to new adults.",
    customerInsight: "Demand for formal wear, gifts, and photography services increases.",
    priority: 2,
  },
  {
    id: "hinamatsuri",
    name: "Hinamatsuri",
    countries: ["JP"],
    region: "All regions",
    month: 3,
    day: 3,
    type: "Girl's Festival",
    significance: "A traditional celebration of girls' health and happiness.",
    celebration: "Doll displays are decorated, and special sweets are enjoyed.",
    foods: ["Hishimochi", "Chirashi sushi", "Wagashi sweets"],
    attire: "Bright, cheerful clothing",
    colors: ["Pink", "White", "Red"],
    culturalNotes: "This is a treasured family tradition, so gentle care is appreciated.",
    businessTips: "Soft, gentle communication creates a sense of comfort.",
    priority: 2,
  },
  {
    id: "kodomo",
    name: "Children's Day",
    countries: ["JP"],
    region: "All regions",
    month: 5,
    day: 5,
    type: "Children's Holiday",
    significance: "A traditional celebration of children's growth and well-being.",
    celebration: "Carp streamers are displayed, and families enjoy outings and meals.",
    foods: ["Kashiwa mochi", "Wagashi sweets", "Grilled chicken"],
    attire: "Casual, bright clothing",
    colors: ["Blue", "Red", "White"],
    culturalNotes: "Many children are out during this holiday, so consideration for noise is appreciated.",
    businessTips: "Friendly, approachable service makes customers feel welcome.",
    priority: 2,
  },
  {
    id: "obon",
    name: "Obon",
    countries: ["JP"],
    region: "All regions",
    month: 8,
    day: 15,
    type: "Ancestral Remembrance",
    significance: "A significant Japanese custom honoring ancestors and family bonds.",
    celebration: "People return home to visit family graves and altars.",
    foods: ["Obon cuisine", "Vegetarian dishes", "Sweets"],
    attire: "Calm, modest clothing",
    colors: ["White", "Pale colors", "Gold"],
    culturalNotes: "This is a time for family gatherings, so avoid rushing customers.",
    businessTips: "A gentle, patient approach is effective during this important family season.",
    priority: 2,
  },
  {
    id: "respect-for-the-aged",
    name: "Respect for the Aged Day",
    countries: ["JP"],
    region: "All regions",
    month: 9,
    day: 15,
    type: "Appreciation for Elders",
    significance: "A day to express gratitude to elderly family members.",
    celebration: "Gifts are given to elders, and families gather for meals.",
    foods: ["Grilled fish", "Stewed vegetables", "Wagashi sweets"],
    attire: "Calm, respectful clothing",
    colors: ["Brown", "Red", "Gold"],
    culturalNotes: "Respect for elders is valued, so courteous behavior is important.",
    businessTips: "A gentle, respectful tone is most effective.",
    priority: 2,
  },
  {
    id: "seven-five-three",
    name: "Shichigosan",
    countries: ["JP"],
    region: "All regions",
    month: 11,
    day: 15,
    type: "Children's Milestone Festival",
    significance: "A traditional celebration of children's growth.",
    celebration: "Visits to shrines in formal clothing and family photo sessions are common.",
    foods: ["Senbei", "Wagashi sweets", "Tea"],
    attire: "Formal or festive clothing",
    colors: ["Pink", "White", "Navy"],
    culturalNotes: "This is a cherished family memory, so maintaining a quiet atmosphere is appreciated.",
    businessTips: "A relaxed, patient approach enhances the experience.",
    priority: 2,
  },
  {
    id: "christmas-jp",
    name: "Christmas",
    countries: ["JP"],
    region: "All regions",
    month: 12,
    day: 25,
    type: "Year-End Celebration",
    significance: "A popular time for family and romantic outings in Japan.",
    celebration: "Viewing illuminations, enjoying festive meals and cakes together.",
    foods: ["Cake", "Christmas dinner", "Sweets"],
    attire: "Casual to slightly festive clothing",
    colors: ["Red", "Green", "White"],
    culturalNotes: "While commercialized, it remains a time for togetherness.",
    businessTips: "A light, friendly approach works well.",
    conversationTip: "Light conversation and sweet treats are good topics.",
    customerInsight: "Demand increases for gifts, sweets, and photography services.",
    priority: 2,
  },
  {
    id: "christmas-us",
    name: "Christmas",
    countries: ["US"],
    region: "All regions",
    month: 12,
    day: 25,
    type: "Christian Holiday",
    significance: "An important family holiday celebrating Jesus Christ's birth in America.",
    celebration: "Church attendance, family dinner, and gift exchanges are typical.",
    foods: ["Turkey", "Stuffing", "Pie"],
    attire: "Casual to warm family clothing",
    colors: ["Red", "Green", "Gold"],
    culturalNotes: "This has religious significance, so showing respect for family time is important.",
    businessTips: "A courteous, brief greeting shows respect for their family time.",
    priority: 3,
  },
];

let activeMonth = new Date();
activeMonth.setDate(1);
let selectedDate = getTodayIso();
let selectedCountryCodes = loadSelectedCountries();

function loadSelectedCountries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) {
      const validCodes = saved.filter((code) => countryLookup[code]);
      if (validCodes.length > 0) {
        return new Set(validCodes);
      }
    }
  } catch {
    // Continue with defaults.
  }

  return new Set(countries.map((country) => country.code));
}

function saveSelectedCountries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedCountryCodes)));
}

function pad(number) {
  return number.toString().padStart(2, "0");
}

function getTodayIso() {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(date);
}

function formatLongDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(year, month - 1, day));
}

function getEventDateKey(event, year) {
  return `${year}-${pad(event.month)}-${pad(event.day)}`;
}

function getVisibleEvents() {
  return events.filter((event) => event.countries.some((code) => selectedCountryCodes.has(code)));
}

function getEventsForDate(dateKey) {
  const [year] = dateKey.split("-").map(Number);
  return getVisibleEvents().filter((event) => getEventDateKey(event, year) === dateKey);
}

function getCountryNames(codes) {
  return codes.map((code) => countryLookup[code].name).join(" / ");
}

function getCountryFlags(codes) {
  return codes.map((code) => countryLookup[code].flag).join(" ");
}

function renderCountryFilters() {
  countryFilters.innerHTML = "";

  countries.forEach((country) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${selectedCountryCodes.has(country.code) ? " chip--active" : ""}`;
    button.textContent = `${country.flag} ${country.name}`;
    button.addEventListener("click", () => {
      if (selectedCountryCodes.has(country.code)) {
        selectedCountryCodes.delete(country.code);
      } else {
        selectedCountryCodes.add(country.code);
      }
      saveSelectedCountries();
      render();
    });
    countryFilters.appendChild(button);
  });
}

function renderTodayEvents() {
  const today = getTodayIso();
  const dayEvents = getEventsForDate(today);
  todayTitle.textContent = formatLongDate(today);
  todaySummary.textContent = dayEvents.length > 0 ? `${dayEvents.length} important events today` : "No special events today";

  todayEvents.innerHTML = "";

  if (dayEvents.length === 0) {
    todayEvents.innerHTML = '<div class="empty-state">No events today for selected countries.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  dayEvents.forEach((event) => {
    const article = document.createElement("article");
    article.className = `event-card${event.priority >= 3 ? " event-card--high" : ""}`;
    article.innerHTML = `
      <div class="event-card__header">
        <div>
          <div class="event-card__flags">${getCountryFlags(event.countries)}</div>
          <h3 class="event-card__title">${event.name}</h3>
          <p class="event-card__type">${event.type}</p>
        </div>
        <span class="badge ${event.priority >= 3 ? "badge--high" : "badge--medium"}">${event.priority >= 3 ? "Important" : "Standard"}</span>
      </div>
      <p class="event-card__meta">${getCountryNames(event.countries)}${event.region ? `・${event.region}` : ""}</p>
      <div class="event-card__section">
        <h3>Why It's Important</h3>
        <p>${event.significance}</p>
      </div>
      <div class="event-card__section">
        <h3>How It's Celebrated</h3>
        <p>${event.celebration}</p>
      </div>
    `;
    fragment.appendChild(article);
  });

  todayEvents.appendChild(fragment);
}

function renderCalendar() {
  calendarMonth.textContent = formatMonth(activeMonth);
  calendarGrid.innerHTML = "";

  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTodayIso();

  for (let index = 0; index < startDay; index += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar__day calendar__day--empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
    const dayEvents = getEventsForDate(dateKey);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar__day";
    if (dateKey === today) cell.classList.add("calendar__day--today");
    if (dateKey === selectedDate) cell.classList.add("calendar__day--selected");
    if (dayEvents.length > 0) cell.classList.add("calendar__day--has-events");
    if (dayEvents.some((event) => event.priority >= 3)) cell.classList.add("calendar__day--important");

    const dayLabel = document.createElement("span");
    dayLabel.className = "calendar__day-date";
    dayLabel.textContent = day;
    cell.appendChild(dayLabel);

    if (dayEvents.length > 0) {
      const pillList = document.createElement("div");
      pillList.className = "calendar__pill-list";
      dayEvents.slice(0, 2).forEach((event) => {
        const pill = document.createElement("span");
        pill.className = `calendar__pill${event.priority >= 3 ? " calendar__pill--important" : ""}`;
        pill.textContent = event.name;
        pillList.appendChild(pill);
      });
      if (dayEvents.length > 2) {
        const pill = document.createElement("span");
        pill.className = "calendar__pill";
        pill.textContent = `+${dayEvents.length - 2}`;
        pillList.appendChild(pill);
      }
      cell.appendChild(pillList);
    }

    cell.addEventListener("click", () => {
      selectedDate = dateKey;
      render();
    });

    calendarGrid.appendChild(cell);
  }
}

function getPriorityText(priority) {
  if (priority >= 3) return { label: "High", className: "badge--high", text: "Important" };
  if (priority === 2) return { label: "Medium", className: "badge--medium", text: "Notable" };
  return { label: "Low", className: "badge--low", text: "Low" };
}

function renderPriorityStars(priority) {
  const maxStars = 3;
  const filled = "★".repeat(Math.min(priority, maxStars));
  const empty = "☆".repeat(maxStars - Math.min(priority, maxStars));
  return `<span>${filled}${empty}</span>`;
}

function getUpcomingEvents() {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);

  return getVisibleEvents()
    .map((event) => {
      const eventThisYear = new Date(today.getFullYear(), event.month - 1, event.day);
      const occurrence = eventThisYear < today ? new Date(today.getFullYear() + 1, event.month - 1, event.day) : eventThisYear;
      return { event, occurrence };
    })
    .filter(({ occurrence }) => occurrence >= today && occurrence <= endDate)
    .sort((a, b) => {
      if (b.event.priority !== a.event.priority) return b.event.priority - a.event.priority;
      return a.occurrence - b.occurrence;
    });
}

function renderComingUp() {
  const upcoming = getUpcomingEvents();
  comingUpList.innerHTML = "";

  if (upcoming.length === 0) {
    comingUpNote.textContent = "No important events in the next 30 days.";
    comingUpList.innerHTML = '<div class="empty-state">No events coming up for selected countries in the next 30 days.</div>';
    return;
  }

  comingUpNote.textContent = `${upcoming.length} notable events coming in the next 30 days.`;

  const fragment = document.createDocumentFragment();
  upcoming.slice(0, 4).forEach(({ event, occurrence }) => {
    const card = document.createElement("article");
    card.className = `event-card${event.priority >= 3 ? " event-card--high" : ""}`;
    card.innerHTML = `
      <div class="event-card__header">
        <div>
          <div class="event-card__flags">${getCountryFlags(event.countries)}</div>
          <h3 class="event-card__title">${event.name}</h3>
          <p class="event-card__type">${event.type}</p>
          <div class="event-card__stars">${renderPriorityStars(event.priority)}</div>
        </div>
        <span class="badge ${getPriorityText(event.priority).className}">${getPriorityText(event.priority).text}</span>
      </div>
      <p class="event-card__meta">${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(occurrence)}・${getCountryNames(event.countries)}</p>
      <div class="event-card__section">
        <p>${event.significance}</p>
      </div>
    `;
    fragment.appendChild(card);
  });

  if (upcoming.length > 4) {
    const more = document.createElement("div");
    more.className = "calendar__day-date";
    more.textContent = `+ ${upcoming.length - 4} more`; 
    fragment.appendChild(more);
  }

  comingUpList.appendChild(fragment);
}

function renderSelectedDay() {
  selectedDateTitle.textContent = formatLongDate(selectedDate);
  selectedDayEvents.innerHTML = "";

  const eventsForSelectedDay = getEventsForDate(selectedDate);

  if (eventsForSelectedDay.length === 0) {
    selectedDayEvents.innerHTML = '<div class="empty-state">No cultural events to display for this date.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  eventsForSelectedDay.forEach((event) => {
    const article = document.createElement("article");
    article.className = `event-card${event.priority >= 3 ? " event-card--high" : ""}`;
    article.innerHTML = `
      <div class="event-card__header">
        <div>
          <div class="event-card__flags">${getCountryFlags(event.countries)}</div>
          <h3 class="event-card__title">${event.name}</h3>
          <p class="event-card__type">${event.type}</p>
          <div class="event-card__stars">${renderPriorityStars(event.priority)}</div>
        </div>
        <span class="badge ${event.priority >= 3 ? "badge--high" : event.priority === 2 ? "badge--medium" : "badge--low"}">${event.priority >= 3 ? "Important" : event.priority === 2 ? "Notable" : "Low"}</span>
      </div>
      <p class="event-card__meta">${getCountryNames(event.countries)}${event.region ? `・${event.region}` : ""}</p>
      <div class="event-card__section">
        <h3>Why It's Important</h3>
        <p>${event.significance}</p>
      </div>
      <div class="event-card__section">
        <h3>How It's Celebrated</h3>
        <p>${event.celebration}</p>
      </div>
      <div class="event-card__section">
        <h3>Common Foods</h3>
        <p>${event.foods.join(" / ")}</p>
      </div>
      <div class="event-card__section">
        <h3>Traditional Attire</h3>
        <p>${event.attire}</p>
      </div>
      <div class="event-card__section">
        <h3>Colors & Decorations</h3>
        <p>${event.colors.join(" / ")}</p>
      </div>
      <div class="event-card__section">
        <h3>Cultural Considerations</h3>
        <p>${event.culturalNotes}</p>
      </div>
      <div class="event-card__section">
        <h3>Customer Service Tips</h3>
        <p>${event.businessTips}</p>
      </div>
      ${event.conversationTip ? `
      <div class="event-card__section">
        <h3>Conversation Tips</h3>
        <p>${event.conversationTip}</p>
      </div>
      ` : ""}
      ${event.customerInsight ? `
      <div class="event-card__section">
        <h3>Customer Insights</h3>
        <p>${event.customerInsight}</p>
      </div>
      ` : ""}
    `;
    fragment.appendChild(article);
  });

  selectedDayEvents.appendChild(fragment);
}

function render() {
  renderCountryFilters();
  renderTodayEvents();
  renderComingUp();
  renderCalendar();
  renderSelectedDay();
}

prevMonthBtn.addEventListener("click", () => {
  activeMonth.setMonth(activeMonth.getMonth() - 1);
  render();
});

nextMonthBtn.addEventListener("click", () => {
  activeMonth.setMonth(activeMonth.getMonth() + 1);
  render();
});

render();
