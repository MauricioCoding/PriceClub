// src/components/Home.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Home() {
  const { token } = useAuth();
  const { count } = useCart();

  return (
    <section className="container px-3 py-3">
      {/* Hero */}
      <div className="bg-light rounded-4 shadow-sm p-4 p-sm-5 text-center text-sm-start">
        <h1 className="h3 fw-bold mb-2">Welcome to Price Club</h1>
        <p className="text-muted mb-4">
          Smart prices, simple checkout, and a smooth mobile experience.
        </p>

        <div className="d-grid gap-2 d-sm-flex">
          <Link to="/products" className="btn btn-primary btn-lg">
            Browse products
          </Link>

          {token ? (
            <Link to="/cart" className="btn btn-outline-secondary btn-lg">
              Cart ({count})
            </Link>
          ) : (
            <Link to="/login" className="btn btn-outline-secondary btn-lg">
              Log in
            </Link>
          )}
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-4 row g-3">
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card rounded-4 h-100 shadow-sm">
            <div className="card-body d-flex align-items-start gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div>
                <h2 className="h5 mb-1">Mobile-first</h2>
                <p className="text-muted mb-0">Layouts stack by default and enhance gracefully on larger screens.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card rounded-4 h-100 shadow-sm">
            <div className="card-body d-flex align-items-start gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 10 19h9v-2h-8.42a.25.25 0 0 1-.22-.37L11.1 14h6.45a2 2 0 0 0 1.83-1.19l2.49-5.5A1 1 0 0 0 21 6H7.42L7 4z" fill="currentColor" />
              </svg>
              <div>
                <h2 className="h5 mb-1">Fast checkout</h2>
                <p className="text-muted mb-0">Add to cart quickly and see totals update instantly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card rounded-4 h-100 shadow-sm">
            <div className="card-body d-flex align-items-start gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3 7h7l-5.6 4.1L18.9 21 12 16.9 5.1 21l2.5-7.9L2 9h7z" fill="currentColor" />
              </svg>
              <div>
                <h2 className="h5 mb-1">Clean UI</h2>
                <p className="text-muted mb-0">Bootstrap utilities keep spacing, borders, and type consistent.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 text-center">
        <Link to="/products" className="btn btn-dark btn-lg">
          Start shopping
        </Link>
      </div>
    </section>
  );
}
