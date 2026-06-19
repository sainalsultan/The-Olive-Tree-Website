import { useState, useRef, useEffect, useCallback } from "react";
import LeafIcon from "./LeafIcon";
import { MENU_DATA } from "../constants/restaurant";

const CATEGORIES = [
  { key: "starters", label: "Starters" },
  { key: "mains", label: "Mains" },
  { key: "desserts", label: "Desserts" },
  { key: "drinks", label: "Drinks" },
  { key: "setmenus", label: "Set Menus" },
];

// Number of cards visible at once before scroll arrows are needed
const VISIBLE_CARDS_THRESHOLD = 3;

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

function MenuCarousel({ items }) {
  const trackRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const needsArrows =
  !isMobile &&
  items &&
  items.length > VISIBLE_CARDS_THRESHOLD;

  const updateArrowState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    // Reset scroll position and recalc arrow state whenever the item set changes
    const el = trackRef.current;
    if (el) el.scrollTo({ left: 0 });
    updateArrowState();
  }, [items, updateArrowState]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateArrowState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateArrowState]);

  const scrollByCard = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector(".mn-card");
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : el.clientWidth / 3;
    const gap = 14; // matches CSS gap between cards
    el.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <div className="mn-carousel">
      <div className="mn-cards" ref={trackRef}>
        {items?.map((item) => (
          <MenuCard key={item.name} {...item} />
        ))}
      </div>

      {needsArrows && (
        <div className="mn-carousel-arrows">
          <button
            type="button"
            className="mn-arrow"
            aria-label="Scroll previous"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
          >
            ‹
          </button>
          <button
            type="button"
            className="mn-arrow"
            aria-label="Scroll next"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default function Menu({ onReserve }) {
  const [activeCat, setActiveCat] = useState("starters");
  const { starters, mains, desserts, drinks, setMenus } = MENU_DATA;

  const itemsMap = { starters, mains, desserts, drinks };
  const currentItems = itemsMap[activeCat];

  return (
    <section className="section section-dark" id="menu">
      <div className="container">
        {/* ── Header ── */}
        <div className="mn-header">
          <div>
          <div className="about-eyebrow">
              <span className="about-eyebrow-line" />
              <div className="section-label">Our Menu</div>
            </div>
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
              <MenuCarousel items={currentItems} />
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