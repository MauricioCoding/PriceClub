// src/components/Header.tsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

type Props = { title?: string };

export default function Header({ title = "Price Club" }: Props) {
  const { token, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const menuId = "site-menu";
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);

  // Measure panel height
  useEffect(() => {
    const measure = () => setContentH(contentRef.current?.scrollHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Recalculate when opening or auth state changes
  useEffect(() => {
    if (open) setContentH(contentRef.current?.scrollHeight ?? 0);
  }, [open, token]);

  // Close on Escape
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  const toggleMenu = () => setOpen((v) => !v);
  const closeMenu = () => setOpen(false);

  return (
    <header className="container-fluid px-3 pt-2 position-relative">
      <div className="bg-light rounded-4 shadow-sm px-3 py-2 d-flex align-items-center justify-content-between">
        <div className="fs-5 fw-semibold text-dark text-truncate">{title}</div>

        <div className="d-flex align-items-center gap-2">
          {/* Cart (compact) */}
          <Link
            to="/cart"
            className="position-relative p-0 btn btn-link text-dark"
            aria-label="Cart"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 10 19h9v-2h-8.42a.25.25 0 0 1-.22-.37L11.1 14h6.45a2 2 0 0 0 1.83-1.19l2.49-5.5A1 1 0 0 0 21 6H7.42L7 4z"
                fill="currentColor"
              />
            </svg>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">
              {count}
              <span className="visually-hidden">items in cart</span>
            </span>
          </Link>

          {/* Hamburger (fixed square tap target) */}
          <button
            className="btn p-0 d-inline-flex align-items-center justify-content-center border-0 bg-transparent"
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={toggleMenu}
            style={{ width: 36, height: 36, lineHeight: 0 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Menu panel (content-sized box) */}
      <div
        id={menuId}
        className="position-absolute top-100 end-0 me-3 bg-white z-3 shadow-lg rounded-4 overflow-hidden"
        aria-hidden={!open}
        style={{
          width: "max-content",       // shrink to content
          minWidth: "7rem",          // don’t get too tiny
          maxWidth: "85vw",           // safe on small screens
          maxHeight: open ? contentH : 0,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transition:
            "max-height 250ms ease, opacity 200ms ease, transform 250ms ease",
          willChange: "max-height, opacity, transform",
        }}
      >
        <div ref={contentRef}>
          <div className="p-2">
            {/* CENTERED CONTENT (no w-100 so the box can shrink) */}
            <ul className="list-unstyled text-center mb-0">
              <li className="mb-1">
                <Link
                  className="text-decoration-none text-dark fs-6 d-inline-block py-1 px-2"
                  to="/"
                  onClick={closeMenu}
                >
                  Home
                </Link>
              </li>
              <li className="mb-1">
                <Link
                  className="text-decoration-none text-dark fs-6 d-inline-block py-1 px-2"
                  to="/products"
                  onClick={closeMenu}
                >
                  Products
                </Link>
              </li>
              {token && (
                <li className="mb-1">
                  <Link
                    className="text-decoration-none text-dark fs-6 d-inline-block py-1 px-2"
                    to="/orders"
                    onClick={closeMenu}
                  >
                    Orders
                  </Link>
                </li>
              )}
            </ul>

            <div className="mt-2 d-flex justify-content-center">
              {token ? (
                <button
                  className="btn btn-outline-danger btn-sm px-3 py-1"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-outline-primary btn-sm px-3 py-1"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

