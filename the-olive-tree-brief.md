# Project Brief — “The Olive Tree” AI Demo

**Client:** AuraWeb ([jeremy@getauraweb.com](mailto:jeremy@getauraweb.com))  
**Freelancer:** Sainal Sultan  
**Budget:** $100 fixed price  
**Deadline:** 3–5 days from receipt of this brief

-----

## 1. Project Overview

AuraWeb is an AI automation agency. This demo is a sales tool we will show to restaurant prospects to demonstrate what an AI assistant can do for their business. The fictional restaurant is called **The Olive Tree** — a mid-upscale Mediterranean restaurant based in Paris.

The goal is for a prospect to land on this page, interact with the AI chat, and immediately understand the value: “my customers could have this experience on my website.”

-----

## 2. Scope (Fixed — no changes without prior approval)

Three deliverables, all in one package:

**A. Live web page**

- Clean, professional restaurant website feel
- Sections: Hero, About, Menu highlights, Contact/Hours
- Must work on mobile (most restaurant owners will view on phone)
- Language: English

**B. Functional AI chat assistant**

- Embedded chat widget on the page (bottom-right corner)
- Powered by the Claude API (Anthropic)
- Answers questions based on the knowledge base in Section 4
- Responds naturally, warmly, in character as a restaurant assistant
- Use your own API key during development — we will switch to the client key at final delivery

**C. Simulated booking view**

- When a user asks to book a table, the chat collects: name, date, time, party size
- After collection, displays a confirmation screen (simulated — no real backend needed)
- Example: “Great, your table for 2 on Friday 20 June at 7:30pm has been reserved. See you soon!”

-----

## 3. Technical Requirements

- **Hosting:** Deliverable must be compatible with our stack: **Firebase (frontend) + Heroku (backend)**
- Provide clear deployment instructions (step-by-step, assumes non-developer deploying)
- **API key:** Use yours during dev/test. At delivery, provide instructions to swap to our key
- Single clean GitHub repo or zip file with all source code
- No third-party services requiring paid subscriptions (except Anthropic API)

-----

## 4. Restaurant Knowledge Base

This is the information the AI must know and use in its answers.

**Restaurant name:** The Olive Tree  
**Concept:** Mediterranean cuisine — fresh, seasonal, warm atmosphere  
**Address:** 12 Rue de la Paix, 75002 Paris  
**Phone:** +33 1 42 00 00 00  
**Email:** [hello@theolivetree-paris.com](mailto:hello@theolivetree-paris.com)  
**Hours:**

- Monday–Friday: 12:00pm–2:30am (lunch), 7:00pm–10:30pm (dinner)
- Saturday: 7:00pm–11:00pm (dinner only)
- Sunday: Closed

**Reservations:**

- Accepted for lunch and dinner, up to 2 weeks in advance
- Groups of 6+ must call directly
- Cancellation policy: free up to 24 hours before; late cancellations may incur a €20/person fee

**Menu highlights:**

- Starters: Burrata with heirloom tomatoes (€14), Grilled octopus (€17), Mezze platter for 2 (€22)
- Mains: Branzino with lemon butter (€28), Lamb chops with rosemary (€32), Mushroom risotto (€22)
- Desserts: Baklava cheesecake (€10), Citrus panna cotta (€9)
- Set menus: Lunch menu 2 courses €22, 3 courses €28. Dinner tasting menu 4 courses €55

**Dietary options:**

- Vegetarian options available (marked on menu)
- Gluten-free options available on request — ask your server
- Nut allergy: kitchen handles nuts — guests with severe allergies should inform staff on arrival

**Parking:** No private parking. Nearest public parking: Parking Vendôme, 2 min walk  
**Private events:** Yes, the restaurant can be privatised for groups of 20–40 people. Contact by email for availability and pricing.

-----

## 5. Conversation Scenarios

The AI must handle these scenarios naturally. Test each one before delivery.

1. **Table booking** — “I’d like to reserve a table for 2 this Saturday at 8pm” → collect details → show simulated confirmation
1. **Menu questions** — “Do you have vegetarian options?” / “What’s your most popular dish?” / “How much is the tasting menu?”
1. **Allergy questions** — “I’m gluten intolerant, can you accommodate me?” / “Is there anything with nuts?”
1. **Opening hours** — “Are you open on Sundays?” / “What time does the kitchen close?”
1. **Location & parking** — “Where are you located?” / “Is there parking nearby?”
1. **Private events** — “I’d like to organise a private dinner for 30 people” → redirect to email contact
1. **Out of scope** — If asked something the AI can’t answer (e.g. “what’s the weather like?”), it should politely redirect: “I’m here to help with anything related to The Olive Tree — feel free to ask about our menu, reservations, or opening hours!”

-----

## 6. Tone Guidelines

- **Warm and welcoming** — like a friendly maître d’, not a robot
- **Concise** — answers in 2–4 sentences max, no long paragraphs
- **Professional but not stiff** — conversational English, no jargon
- **In character** — the AI speaks as “The Olive Tree team”, not as a generic AI assistant
- **No hallucination** — if the AI doesn’t know something, it says so and offers to help with what it does know

Example of good tone:

> “We’d love to have you! We’re open for dinner on Saturdays from 7pm to 11pm. Shall I help you book a table?”

Example of bad tone:

> “According to our database, Saturday dinner service commences at 19:00 and concludes at 23:00.”

-----

## 7. Acceptance Criteria

The deliverable will be accepted when:

- [ ] Page is live and accessible via a URL
- [ ] AI chat responds correctly to all 7 scenarios above
- [ ] Booking simulation collects details and shows confirmation message
- [ ] Page is mobile-responsive
- [ ] Deployment instructions are clear and complete
- [ ] API key swap instructions are included

**If any of the above are missing, delivery will not be validated and payment will not be released.**

-----

## 8. What to Flag Before Starting

As agreed, if anything in this brief causes you to revise the $100 fixed price, flag it **before starting development**. No scope changes will be accepted after work has begun without a written agreement.

-----

*Brief issued by AuraWeb — [jeremy@getauraweb.com](mailto:jeremy@getauraweb.com)*