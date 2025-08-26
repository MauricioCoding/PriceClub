// src/components/Cart.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

type CheckoutResponse = {
  orderId?: number;
  message?: string;
};

const CHECKOUT_ENDPOINT = "/orders/checkout"; // change to "/orders" if your API uses that

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function Cart() {
  const { items, update, remove, clear, subtotal } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQtyDec = (productId: number, current: number) => {
    if (placing) return;
    update(productId, Math.max(0, current - 1));
  };

  const handleQtyInc = (productId: number, current: number, max: number) => {
    if (placing) return;
    update(productId, Math.min(max, current + 1));
  };

  const handleQtyInput = (productId: number, value: string, max: number) => {
    if (placing) return;
    const n = Math.max(0, Math.min(max, Number(value || 0)));
    update(productId, n);
  };

  async function placeOrder() {
    setError(null);
    setSuccessMsg(null);
    setOrderId(null);

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }
    if (!token) {
      // Gentle nudge to login; preserve intent by sending to login
      navigate("/login", { replace: true, state: { from: "/cart" } });
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${CHECKOUT_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((it) => ({
            product_id: it.product.id,
            quantity: it.quantity,
          })),
          // You can include subtotal if your API expects it:
          // total: Number(subtotal.toFixed(2)),
        }),
      });

      let data: CheckoutResponse & { error?: string } = {};
      try {
        data = (await res.json()) as CheckoutResponse & { error?: string };
      } catch {
        // non-JSON response — handle via status
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || "Unable to place the order.");
      }

      clear();
      setOrderId(typeof data.orderId === "number" ? data.orderId : null);
      setSuccessMsg(
        data.message ??
          "Order confirmed! You’ll receive a confirmation shortly. Thanks for shopping with Price Club."
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong while placing your order.";
      setError(message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="container px-3 py-3">
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        <h1 className="h4 fw-bold mb-3">Your cart</h1>

        {/* Empty state */}
        {!items.length && !successMsg && (
          <div className="bg-light rounded-4 shadow-sm p-4 text-center">
            <p className="mb-3 text-muted">Your cart is empty.</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Browse products
            </Link>
          </div>
        )}

        {/* Cart items */}
        {items.length > 0 && (
          <div className="vstack gap-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="card rounded-4 shadow-sm">
                <div className="card-body d-flex flex-column gap-3">
                  {/* Top row: title + price */}
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                    <div>
                      <h2 className="h6 mb-1">{product.name}</h2>
                      <div className="text-muted small">
                        In stock: {product.stock}
                      </div>
                    </div>
                    <div className="fw-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(Number(product.price))}
                    </div>
                  </div>

                  {/* Controls row */}
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="input-group" style={{ maxWidth: 180 }}>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => handleQtyDec(product.id, quantity)}
                        disabled={placing}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="form-control text-center"
                        value={quantity}
                        min={0}
                        max={product.stock}
                        onChange={(e) => handleQtyInput(product.id, e.target.value, product.stock)}
                        disabled={placing}
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => handleQtyInc(product.id, quantity, product.stock)}
                        disabled={placing}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => remove(product.id)}
                      disabled={placing}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-light rounded-4 shadow-sm p-3 p-sm-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-semibold">Subtotal</span>
                <span className="fw-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="d-grid gap-2 d-sm-flex">
                <Link to="/products" className="btn btn-outline-secondary btn-lg">
                  Continue shopping
                </Link>
                <button
                  type="button"
                  className="btn btn-primary btn-lg d-inline-flex align-items-center justify-content-center gap-2 flex-fill"
                  onClick={placeOrder}
                  disabled={placing || items.length === 0}
                >
                  {placing && (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  )}
                  <span>{placing ? "Placing order..." : "Place order"}</span>
                </button>
              </div>

              {/* Error / Success messages (mobile-first, below the button) */}
              <div className="mt-3" aria-live="polite">
                {error && (
                  <div role="alert" className="alert alert-danger mb-0">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div role="status" className="alert alert-success mb-0">
                    <div className="fw-semibold">Order confirmed</div>
                    <div className="small mt-1">
                      {successMsg}
                      {orderId !== null && (
                        <>
                          {" "}
                          <span className="text-muted">Order #</span>
                          <span className="fw-semibold">{orderId}</span>
                          .
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* If the cart is now empty but we just placed an order, keep the confirmation visible */}
        {!items.length && successMsg && (
          <div className="bg-light rounded-4 shadow-sm p-4 mt-3" aria-live="polite">
            <div role="status" className="alert alert-success mb-0">
              <div className="fw-semibold">Order confirmed</div>
              <div className="small mt-1">
                {successMsg}
                {orderId !== null && (
                  <>
                    {" "}
                    <span className="text-muted">Order #</span>
                    <span className="fw-semibold">{orderId}</span>.
                  </>
                )}
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <Link to="/products" className="btn btn-primary">Keep shopping</Link>
              <Link to="/" className="btn btn-outline-secondary">Go home</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
