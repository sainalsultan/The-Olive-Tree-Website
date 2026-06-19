export const MODEL = "claude-haiku-4-5-20251001";
export const ANTHROPIC_VERSION = "2023-06-01";

// ---------------------------------------------------------------------------
// Menu data (mirrors the .md knowledge base — used for UI rendering only)
// ---------------------------------------------------------------------------
export const MENU_DATA = {
  starters: [
    {
      name: "Soupe à l'oignon gratinée",
      desc: "Classic French onion soup with a golden gruyère crust",
      price: "€9",
      vegetarian: true,
      image: "/images/menu/img-starters1.webp",
    },
    {
      name: "Foie gras maison",
      desc: "House-made foie gras, toasted brioche, Sauternes jelly",
      price: "€16",
      vegetarian: false,
      image: "/images/menu/img-starters2.webp",
    },
    {
      name: "Salade de chèvre chaud",
      desc: "Warm goat cheese salad, honey & walnuts",
      price: "€12",
      vegetarian: true,
      image: "/images/menu/img-starters3.webp",
    },
  ],
  mains: [
    {
      name: "Confit de canard",
      desc: "Duck confit, pommes sarladaises, seasonal vegetables",
      price: "€24",
      vegetarian: false,
      image: "/images/menu/img-mains1.webp",
    },
    {
      name: "Sole meunière",
      desc: "Pan-fried sole, lemon butter sauce, steamed potatoes",
      price: "€28",
      vegetarian: false,
      image: "/images/menu/img-mains2.webp",
    },
    {
      name: "Risotto aux champignons des bois",
      desc: "Wild mushroom risotto, parmesan, fresh herbs",
      price: "€19",
      vegetarian: true,
      image: "/images/menu/img-mains3.webp",
    },
  ],
  desserts: [
    {
      name: "Crème brûlée à la vanille",
      desc: "Classic vanilla crème brûlée with a caramelised crust",
      price: "€8",
      vegetarian: true,
      image: "/images/menu/img-desserts1.webp",
    },
    {
      name: "Tarte tatin",
      desc: "Upside-down apple tart served warm with crème fraîche",
      price: "€9",
      vegetarian: true,
      image: "/images/menu/img-desserts2.webp",
    },
    {
      name: "Moelleux au chocolat",
      desc: "Warm chocolate fondant, vanilla ice cream",
      price: "€9",
      vegetarian: true,
      image: "/images/menu/img-desserts3.webp",
    },
  ],
  drinks: [
    {
      name: "Sélection de vins français",
      desc: "Curated French wine list by our sommelier — by the glass from €6",
      price: "From €6",
      vegetarian: true,
      image: "/images/menu/img-drinks1.webp",
    },
    {
      name: "Kir Royale",
      desc: "Classic French aperitif — crème de cassis topped with champagne",
      price: "€10",
      vegetarian: true,
      image: "/images/menu/img-drinks2.webp",
    },
    {
      name: "Pastis",
      desc: "Traditional anise-flavoured French aperitif, served with water and ice",
      price: "€9",
      vegetarian: true,
      image: "/images/menu/img-drinks3.webp",
    },
    {
      name: "Spritz",
      desc: "Refreshing aperitif with sparkling wine, bitters, and soda",
      price: "€12",
      vegetarian: true,
      image: "/images/menu/img-drinks4.webp",
    },
    {
      name: "Limonade maison",
      desc: "Homemade lemonade, fresh and lightly sweetened",
      price: "€5",
      vegetarian: true,
      image: "/images/menu/img-drinks5.webp",
    },
    {
      name: "Jus de fruits frais",
      desc: "Fresh seasonal fruit juices",
      price: "€5",
      vegetarian: true,
      image: "/images/menu/img-drinks6.webp",
    },
  ],
  setMenus: {
    lunch: {
      courses: [
        { label: "Starter + Main or Main + Dessert", price: "€22" },
        { label: "3 courses", price: "€28" },
      ],
      note: "Tue–Fri 12:00 PM – 2:30 PM",
    },
    dinner: {
      courses: [{ label: "À la carte (avg per person)", price: "€45–55" }],
      note: "Available Tue–Sat evenings",
      featured: true,
    },
  },
};

// ---------------------------------------------------------------------------
// Opening hours (used for UI rendering)
// ---------------------------------------------------------------------------
export const HOURS = [
  {
    day: "Monday",
    slots: [],
    closed: true,
  },
  {
    day: "Tuesday – Friday",
    slots: [
      { label: "Lunch", time: "12:00 PM – 2:30 PM" },
      { label: "Dinner", time: "7:00 PM – 10:30 PM" },
    ],
    closed: false,
  },
  {
    day: "Saturday",
    slots: [{ label: "Dinner", time: "7:00 PM – 11:00 PM" }],
    closed: false,
  },
  {
    day: "Sunday",
    slots: [{ label: "Brunch", time: "12:00 PM – 3:00 PM" }],
    closed: false,
  },
];

// ---------------------------------------------------------------------------
// Restaurant features (used for UI rendering)
// ---------------------------------------------------------------------------
export const FEATURES = [
  {
    icon: "🥐",
    title: "Authentic French Bistrot",
    desc: "Traditional recipes made with seasonal ingredients sourced from local French producers.",
  },
  {
    icon: "🍷",
    title: "Curated Wine List",
    desc: "French wines only, hand-picked by our sommelier — available by the glass from €6.",
  },
  {
    icon: "🎉",
    title: "Private Events",
    desc: "Private room for up to 20 guests. Perfect for birthdays, celebrations, and corporate dinners.",
  },
  {
    icon: "🥗",
    title: "Dietary Friendly",
    desc: "Vegetarian options always available. Vegan and gluten-free options on request.",
  },
];

// ---------------------------------------------------------------------------
// Stats (used for UI rendering)
// ---------------------------------------------------------------------------
export const STATS = [
  { value: "1992", label: "Est. in Paris" },
  { value: "100%", label: "Seasonal menu" },
  { value: "4.8 ★", label: "Google rating" },
];
