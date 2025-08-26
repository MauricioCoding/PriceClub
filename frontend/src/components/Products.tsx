import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts } from "../services/Product";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";

type SortKey = keyof Pick<Product, "name" | "category" | "price" | "stock" | "created_at">;

export default function Products() {
  const [data, setData] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [qtyDraft, setQtyDraft] = useState<Record<number, number>>({});
  const { add, count } = useCart();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const items = await listProducts();
        setData(items);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = s
      ? data.filter((p) =>
          [p.name, p.category ?? "", String(p.price), String(p.stock)]
            .join(" ")
            .toLowerCase()
            .includes(s)
        )
      : data.slice();

    base.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      let cmp = 0;
      if (sortBy === "price" || sortBy === "stock") {
        cmp = Number(av) - Number(bv);
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }
      return dir === "asc" ? cmp : -cmp;
    });

    return base;
  }, [q, data, sortBy, dir]);

  const onAdd = (p: Product) => {
    const draft = qtyDraft[p.id] ?? 1;
    const toAdd = Math.max(1, Math.min(draft, p.stock));
    add(p, toAdd);
    setQtyDraft((d) => ({ ...d, [p.id]: 1 }));
  };

  const dec = (p: Product) => {
    const current = qtyDraft[p.id] ?? 1;
    setQtyDraft((d) => ({ ...d, [p.id]: Math.max(1, current - 1) }));
  };

  const inc = (p: Product) => {
    const current = qtyDraft[p.id] ?? 1;
    setQtyDraft((d) => ({ ...d, [p.id]: Math.min(p.stock, current + 1) }));
  };

  return (
    <section className="container px-3 py-3">
      <div className="d-flex flex-column gap-2 mb-3">
        <h1 className="h4 fw-bold m-0">Products</h1>
        <Link to="/cart" className="btn btn-dark btn-lg">
          Proceed to checkout ({count})
        </Link>
      </div>

      <div className="vstack gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Search by name, category…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
            <option value="created_at">Created</option>
          </select>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label={`Sort ${dir === "asc" ? "descending" : "ascending"}`}
          >
            {dir === "asc" ? "Asc" : "Desc"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="d-flex align-items-center gap-2 text-muted">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          <span>Loading…</span>
        </div>
      )}
      {err && (
        <div className="alert alert-danger" role="alert">
          {err}
        </div>
      )}

      {!loading && !err && (
        <div className="vstack gap-3">
          {filtered.map((p) => {
            const qty = qtyDraft[p.id] ?? 1;
            const out = p.stock <= 0;

            return (
              <div key={p.id} className="card rounded-4 shadow-sm">
                <div className="card-body d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-3">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        width={64}
                        height={64}
                        loading="lazy"
                        style={{ objectFit: "cover" }}
                        className="rounded"
                      />
                    ) : (
                      <div className="rounded bg-light" style={{ width: 64, height: 64 }} aria-hidden="true" />
                    )}

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between gap-2">
                        <h2 className="h6 mb-1">{p.name}</h2>
                        <div className="fw-semibold ms-2" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {formatCurrency(Number(p.price))}
                        </div>
                      </div>
                      <div className="text-muted small">
                        {p.category ?? "-"} • Stock: {p.stock}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center gap-3">
                    <div className="input-group" style={{ maxWidth: 180 }}>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => dec(p)}
                        disabled={out}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="form-control text-center"
                        value={qty}
                        min={1}
                        max={p.stock}
                        onChange={(e) =>
                          setQtyDraft((d) => ({
                            ...d,
                            [p.id]: Math.max(1, Math.min(p.stock, Number(e.target.value) || 1)),
                          }))
                        }
                        disabled={out}
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => inc(p)}
                        disabled={out}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onAdd(p)}
                      disabled={out}
                    >
                      {out ? "Out of stock" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-muted">No products found.</div>
          )}
        </div>
      )}
    </section>
  );
}

function formatCurrency(n: number) {
  if (Number.isNaN(Number(n))) return String(n);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(n));
}
