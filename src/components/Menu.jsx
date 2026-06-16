import { useState } from "react";
import LeafIcon from "./LeafIcon";
import { MENU_DATA } from "../constants/restaurant";

const CATEGORIES = [
  { key: "starters", label: "Starters" },
  { key: "mains", label: "Mains" },
  { key: "desserts", label: "Desserts" },
  { key: "setmenus", label: "Set Menus" },
];

function MenuCard({ name, desc, price, vegetarian, image, icon }) {
  return (
    <div className="mn-card">
      <div className="mn-card-img">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <span className="mn-card-emoji">{icon}</span>
        )}
      </div>
      <div className="mn-card-body">
        <h4 className="mn-card-name">{name}</h4>
        <p className="mn-card-desc">{desc}</p>
        <div className="mn-card-footer">
          <span className="price mn-card-price">{price}</span>
          {vegetarian && <span className="diet-tag">V</span>}
        </div>
      </div>
    </div>
  );
}

function SetMenus({ setMenus }) {
  return (
    <div className="mn-setmenus">
      <div className="set-menu-cards">
        <div className="set-card">
          <strong>Lunch Menu</strong>
          <div className="set-options">
            {setMenus.lunch.courses.map(({ label, price }) => (
              <div key={label}>
                <span>{label}</span>
                <span className="price">{price}</span>
              </div>
            ))}
          </div>
          <p>{setMenus.lunch.note}</p>
        </div>
        <div className="set-card set-card-featured">
          <div className="set-card-tag">Popular</div>
          <strong>Dinner Tasting Menu</strong>
          <div className="set-options">
            {setMenus.dinner.courses.map(({ label, price }) => (
              <div key={label}>
                <span>{label}</span>
                <span className="price">{price}</span>
              </div>
            ))}
          </div>
          <p>{setMenus.dinner.note}</p>
        </div>
      </div>
    </div>
  );
}

export default function Menu({ onReserve }) {
  const [activeCat, setActiveCat] = useState("starters");
  const { starters, mains, desserts, setMenus } = MENU_DATA;

  const catIndex = CATEGORIES.findIndex((c) => c.key === activeCat);
  const goPrev = () =>
    setActiveCat(
      CATEGORIES[(catIndex - 1 + CATEGORIES.length) % CATEGORIES.length].key
    );
  const goNext = () =>
    setActiveCat(CATEGORIES[(catIndex + 1) % CATEGORIES.length].key);

  const itemsMap = { starters, mains, desserts };
  const currentItems = itemsMap[activeCat];

  return (
    <section className="section section-dark" id="menu">
      <div className="container">
        {/* ── Header ── */}
        <div className="mn-header">
          <div>
            <div className="section-label">Our Menu</div>
            <h2 className="mn-h2">
              Our <em>Exquisite</em> Menu
            </h2>
          </div>
        </div>

        {/* ── Body: tabs + cards ── */}
        <div className="mn-body">
          {/* Tab sidebar */}
          <nav className="mn-tabs" aria-label="Menu categories">
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                className={`mn-tab${activeCat === key ? " mn-tab-active" : ""}`}
                onClick={() => setActiveCat(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Content area */}
          <div className="mn-content">
            {activeCat === "setmenus" ? (
              <SetMenus setMenus={setMenus} />
            ) : (
              <div className="mn-cards">
                {currentItems?.map((item) => (
                  <MenuCard key={item.name} {...item} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mn-footer">
          <p className="menu-diet-note">
            <span className="diet-tag">V</span> Vegetarian &nbsp;·&nbsp;
            Gluten-free available on request
          </p>
          <button className="btn-primary" onClick={onReserve}>
            Reserve Your Table
          </button>
        </div>
      </div>
    </section>
  );
}
