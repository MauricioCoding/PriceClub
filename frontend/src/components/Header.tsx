// Header.tsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; // <-- add
import { Link } from "react-router-dom";

type Props = { title?: string };

export default function Header({ title = "Price Club" }: Props) {
  const { token, logout } = useAuth();
  const { count } = useCart(); // <-- use it
  const [open, setOpen] = useState(false);

  const menuId = "site-menu";
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);

  useEffect(() => {
    const measure = () => setContentH(contentRef.current?.scrollHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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
        <div className="fs-4 fw-semibold text-dark">{title}</div>

        <div className="d-flex align-items-center gap-3">
          <Link
            to="/cart"
            className="btn position-relative text-dark"
            aria-label="Cart"
          >
            <div className="d-flex align-items-center text-dark">
              <svg width="24" height="24" viewBox="0 0 24 24" className="me-1">
                <path
                  d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 10 19h9v-2h-8.42a.25.25 0 0 1-.22-.37L11.1 14h6.45a2 2 0 0 0 1.83-1.19l2.49-5.5A1 1 0 0 0 21 6H7.42L7 4z"
                  fill="currentColor"
                />
              </svg>
              <span
                className="fs-6 text-dark"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {count}
              </span>
              <span className="visually-hidden">items in cart</span>
            </div>
          </Link>

          {/* Hamburger */}
          <button
            className="btn btn-link p-0 text-dark"
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls={menuId} // <-- a11y
            onClick={toggleMenu}
          >
            <svg width="28" height="28" viewBox="0 0 24 24">
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

      {/* Slide-down menu */}
      <div
        id={menuId}
        className="position-absolute top-100 end-0 me-3 w-50 bg-white z-3 shadow-lg border-start rounded-bottom-4 overflow-hidden"
        aria-hidden={!open}
        style={{
          maxHeight: open ? contentH : 0,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transition:
            "max-height 250ms ease, opacity 200ms ease, transform 250ms ease",
          willChange: "max-height, opacity, transform",
        }}
      >
        <div ref={contentRef}>
          <div className="d-flex flex-column align-items-end p-4">
            <ul className="list-unstyled text-end w-100">
              <li className="mb-3">
                <Link
                  className="text-decoration-none text-dark fs-4 d-block w-100"
                  to="/"
                  onClick={closeMenu}
                >
                  Home
                </Link>
              </li>
              <li className="mb-3">
                <Link
                  className="text-decoration-none text-dark fs-4 d-block w-100"
                  to="/products"
                  onClick={closeMenu}
                >
                  Products
                </Link>
              </li>
              {token && (
                <li className="mb-3">
                  <Link
                    className="text-decoration-none text-dark fs-4 d-block w-100"
                    to="/orders"
                    onClick={closeMenu}
                  >
                    Orders
                  </Link>
                </li>
              )}
              <li className="mt-4">
                {token ? (
                  <button
                    className="btn btn-outline-danger w-100 fs-4 py-2"
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
                    className="btn btn-outline-primary w-100 fs-4 py-2"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
