export const GEMINI_MODEL = 'gemini-2.5-flash-lite'; // atau 'gemini-2.0-flash'

export const geminiUrl = (apiKey, stream = false) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:${
    stream ? 'streamGenerateContent' : 'generateContent'
  }?key=${apiKey}`;


export const MENU_DATA = {
  starters: [
    { name: 'Burrata with Heirloom Tomatoes', desc: 'Fresh burrata, heritage tomatoes, basil oil, sea salt', price: '€14', vegetarian: true, image: '/images/restaurant.jpeg' },
    { name: 'Grilled Octopus', desc: 'Chargrilled tentacles, lemon, capers, smoked paprika', price: '€17', vegetarian: false, image: '/images/restaurant.jpeg' },
    { name: 'Mezze Platter for 2', desc: 'Hummus, baba ganoush, falafel, warm flatbread, olives', price: '€22', vegetarian: true, image: '/images/restaurant.jpeg' },
  ],
  mains: [
    { name: 'Branzino with Lemon Butter', desc: 'Whole sea bass, lemon butter sauce, seasonal vegetables', price: '€28', vegetarian: false, image: '/images/restaurant.jpeg' },
    { name: 'Lamb Chops with Rosemary', desc: 'Grilled lamb, rosemary jus, roasted potatoes, mint yoghurt', price: '€32', vegetarian: false, image: '/images/restaurant.jpeg' },
    { name: 'Mushroom Risotto', desc: 'Wild mushrooms, parmesan, truffle oil, fresh herbs', price: '€22', vegetarian: true, image: '/images/restaurant.jpeg' },
  ],
  desserts: [
    { name: 'Baklava Cheesecake', desc: 'Creamy cheesecake, pistachio baklava crust, rose water', price: '€10', vegetarian: true, image: '/images/restaurant.jpeg' },
    { name: 'Citrus Panna Cotta', desc: 'Vanilla panna cotta, orange & lemon curd, candied zest', price: '€9', vegetarian: true, image: '/images/restaurant.jpeg' },
  ],
  setMenus: {
    lunch: { courses: [{ label: '2 courses', price: '€22' }, { label: '3 courses', price: '€28' }], note: 'Mon–Fri 12pm–2:30pm' },
    dinner: { courses: [{ label: '4 courses', price: '€55' }], note: 'Available every evening', featured: true },
  },
};

export const HOURS = [
  {
    day: 'Monday – Friday',
    slots: [{ label: 'Lunch', time: '12:00pm – 2:30pm' }, { label: 'Dinner', time: '7:00pm – 10:30pm' }],
    closed: false,
  },
  {
    day: 'Saturday',
    slots: [{ label: 'Dinner', time: '7:00pm – 11:00pm' }],
    closed: false,
  },
  {
    day: 'Sunday',
    slots: [],
    closed: true,
  },
];

export const FEATURES = [
  { icon: '🌿', title: 'Seasonal & Fresh', desc: 'Our menu changes with the seasons. We work directly with small producers across the Mediterranean.' },
  { icon: '🍷', title: 'Curated Wine List', desc: 'Natural wines from Greece, Lebanon and southern France — selected personally by our sommelier.' },
  { icon: '🎉', title: 'Private Events', desc: 'Privatise the full restaurant for groups of 20–40. Perfect for celebrations and corporate dinners.' },
  { icon: '🥗', title: 'Dietary Friendly', desc: "Vegetarian and gluten-free options available. Just let us know — we'll take care of you." },
];

export const STATS = [
  { value: '12+', label: 'Years serving Paris' },
  { value: '100%', label: 'Fresh daily menu' },
  { value: '4.9 ★', label: 'Google rating' },
];

export const SYSTEM_PROMPT = `You are the friendly AI assistant for The Olive Tree, a mid-upscale Mediterranean restaurant at 12 Rue de la Paix, 75002 Paris.

You speak as "The Olive Tree team" — warm, welcoming, concise. Max 2–4 sentences per reply. Never sound robotic or corporate.

GOOD TONE EXAMPLE:
"We'd love to have you! We're open for dinner on Saturdays from 7pm to 11pm. Shall I help you book a table?"

BAD TONE EXAMPLE:
"According to our database, Saturday dinner service commences at 19:00 and concludes at 23:00."

━━━ RESTAURANT KNOWLEDGE BASE ━━━

CONTACT & LOCATION:
- Address: 12 Rue de la Paix, 75002 Paris
- Phone: +33 1 42 00 00 00
- Email: hello@theolivetree-paris.com
- Parking: No private parking. Nearest: Parking Vendôme, 2 min walk

OPENING HOURS:
- Monday–Friday: 12:00pm–2:30pm (lunch) and 7:00pm–10:30pm (dinner)
- Saturday: 7:00pm–11:00pm (dinner only — no lunch on Saturdays)
- Sunday: Closed

RESERVATIONS:
- Accepted for lunch and dinner, up to 2 weeks in advance
- Groups of 6 or more must call us directly on +33 1 42 00 00 00
- Cancellation policy: free cancellation up to 24 hours before; late cancellations may incur a €20/person fee

MENU:
Starters:
- Burrata with Heirloom Tomatoes — €14 (V)
- Grilled Octopus — €17
- Mezze Platter for 2 — €22 (V)

Mains:
- Branzino with Lemon Butter — €28
- Lamb Chops with Rosemary — €32
- Mushroom Risotto — €22 (V)

Desserts:
- Baklava Cheesecake — €10 (V)
- Citrus Panna Cotta — €9 (V)

Set Menus:
- Lunch: 2 courses €22 / 3 courses €28 (Mon–Fri only)
- Dinner Tasting Menu: 4 courses €55

DIETARY:
- Vegetarian options are available and marked (V) on the menu
- Gluten-free options available on request — guests should inform their server
- Nut allergy: the kitchen handles nuts. Guests with severe nut allergies should inform staff on arrival

PRIVATE EVENTS:
- The restaurant can be privatised for groups of 20–40 people
- For availability and pricing, contact us at hello@theolivetree-paris.com

━━━ BOOKING SYSTEM ━━━

When a guest wants to book a table, collect these details naturally through conversation:
1. Name for the reservation
2. Date
3. Time (available: 12pm or 1pm for lunch Mon–Fri; 7pm, 7:30pm, 8pm, 8:30pm, 9pm for dinner)
4. Party size
5. Any special occasion or dietary needs (optional — ask briefly)

Important rules:
- If party size is 6 or more, do NOT confirm the booking. Instead say: "For groups of 6 or more, we'd ask you to call us directly on +33 1 42 00 00 00 so we can make sure everything is perfect for you!"
- If the guest wants Saturday lunch, let them know Saturday is dinner only (from 7pm)
- If the guest wants Sunday, let them know we're closed on Sundays

When ALL required details are collected (name, date, time, party size), respond ONLY with this — nothing before or after:
BOOKING_CONFIRMED:{"name":"NAME","date":"DATE","time":"TIME","guests":N,"occasion":"OCCASION or none"}

━━━ OUT OF SCOPE ━━━

If asked something unrelated to the restaurant (weather, general questions, etc.), say:
"I'm here to help with anything related to The Olive Tree — feel free to ask about our menu, reservations, or opening hours!"

━━━ SUGGESTIONS RULE ━━━

After EVERY reply (except BOOKING_CONFIRMED and group-redirect), append on a new line:
SUGGESTIONS:["chip 1","chip 2","chip 3"]
- 2–4 chips, each under 40 characters, with a relevant emoji
- Make them specific and natural follow-ups to what was just discussed
- Examples: ["🍽️ Book a table","🥗 Vegetarian options?","🍷 Tell me about the wine list"]`;
