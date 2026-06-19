import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  categoriesApi,
  invoicesApi,
  partiesApi,
  productsApi,
  settingsApi,
} from "../../services/api";
import { useAuthStore } from "../../store";
import { formatCurrency } from "../../utils/format";

const PAGE_SIZE = 24;
const TAX_OPTIONS = [
  { id: "gst-5", name: "GST", rate: 5 },
  { id: "gst-12", name: "GST", rate: 12 },
  { id: "gst-18", name: "GST", rate: 18 },
  { id: "gst-28", name: "GST", rate: 28 },
];

const makeSession = (index) => ({
  id: crypto.randomUUID(),
  label: `Customer ${index}`,
  cart: [],
  customer: null,
  discount: 0,
  taxes: [],
  note: "",
  payment: "cash",
});

function useDebouncedValue(value, delay = 280) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function getId(value) {
  return value?._id || value || "";
}

function getProductImage(product) {
  return (
    product?.thumbnail ||
    product?.images?.find((img) => img.isMain)?.url ||
    product?.images?.[0]?.url ||
    ""
  );
}

function getProductPrice(product) {
  return Number(product?.salePrice || 0);
}

function getOriginalPrice(product) {
  const mrp = Number(product?.mrp || 0);
  const price = getProductPrice(product);
  return mrp > price ? mrp : 0;
}

function getDiscountPercent(product) {
  const mrp = getOriginalPrice(product);
  if (!mrp) return 0;
  return Math.round(((mrp - getProductPrice(product)) / mrp) * 100);
}

function productMatchesCode(product, code) {
  const normalized = String(code || "")
    .trim()
    .toLowerCase();
  return [product?.barcode, product?.sku].some(
    (value) =>
      String(value || "")
        .trim()
        .toLowerCase() === normalized,
  );
}

function StockBadge({ stock }) {
  const amount = Number(stock || 0);
  const tone = amount <= 0 ? "red" : amount < 10 ? "orange" : "green";
  const label = amount <= 0 ? "Out" : `${amount} in stock`;
  return <span className={`pos-stock pos-stock-${tone}`}>{label}</span>;
}

function ProductImage({ product, className = "" }) {
  const src = getProductImage(product);
  if (src) {
    return (
      <img className={className} src={src} alt={product.name} loading="lazy" />
    );
  }
  return (
    <div
      className={`pos-image-fallback ${className}`}
      aria-label={product?.name || "Product"}
    >
      {(product?.name || "P").slice(0, 2).toUpperCase()}
    </div>
  );
}

function ProductCard({ product, onAdd, onOpen }) {
  const disabled = Number(product.currentStock || 0) <= 0;
  const original = getOriginalPrice(product);
  const discount = getDiscountPercent(product);

  return (
    <div
      className="pos-product-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(product)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(product)}
    >
      <div className="pos-product-media">
        {!!discount && <span className="pos-discount">-{discount}%</span>}
        <ProductImage product={product} className="pos-product-img" />
      </div>
      <div className="pos-product-body">
        <span className="pos-sku">{product.sku || "No SKU"}</span>
        <strong className="pos-product-name">{product.name}</strong>
        <div className="pos-price-row">
          <span>{formatCurrency(getProductPrice(product))}</span>
          {!!original && <del>{formatCurrency(original)}</del>}
        </div>
        <StockBadge stock={product.currentStock} />
        <button
          type="button"
          className="pos-add-btn"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onAdd(product);
          }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="pos-product-card pos-skeleton-card">
      <div className="pos-skeleton pos-skeleton-img" />
      <div className="pos-skeleton pos-skeleton-line short" />
      <div className="pos-skeleton pos-skeleton-line" />
      <div className="pos-skeleton pos-skeleton-line medium" />
      <div className="pos-skeleton pos-skeleton-button" />
    </div>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!product) return null;
  const original = getOriginalPrice(product);
  const disabled = Number(product.currentStock || 0) <= 0;

  return (
    <div className="pos-modal-backdrop" onMouseDown={onClose}>
      <div
        className="pos-product-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="pos-modal-close" onClick={onClose}>
          x
        </button>
        <div className="pos-detail-image">
          <ProductImage product={product} className="pos-detail-img" />
        </div>
        <div className="pos-detail-content">
          <div className="pos-breadcrumb small">
            <span>{product.category?.name || "Products"}</span>
            <span>/</span>
            <span>{product.subcategory?.name || "General"}</span>
          </div>
          <h2>{product.name}</h2>
          <div className="pos-detail-meta">
            <span>SKU: {product.sku || "NA"}</span>
            <span>Barcode: {product.barcode || "NA"}</span>
          </div>
          <div className="pos-detail-price">
            <strong>{formatCurrency(getProductPrice(product))}</strong>
            {!!original && <del>{formatCurrency(original)}</del>}
            {!!getDiscountPercent(product) && (
              <span>{getDiscountPercent(product)}% off</span>
            )}
          </div>
          <div className="pos-stock-row">
            <span>Available stock</span>
            <StockBadge stock={product.currentStock} />
          </div>
          <button
            type="button"
            className="pos-checkout"
            disabled={disabled}
            onClick={() => {
              onAdd(product);
              onClose();
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchOverlay({ open, onClose, onAdd }) {
  const [term, setTerm] = useState("");
  const debounced = useDebouncedValue(term);
  const inputRef = useRef(null);

  const { data, isFetching } = useQuery({
    queryKey: ["pos-search-products", debounced],
    enabled: open && debounced.trim().length > 0,
    queryFn: async () => {
      const requests = await Promise.allSettled([
        productsApi.list({
          search: debounced,
          status: "active",
          limit: 12,
          page: 1,
        }),
        productsApi.list({
          sku: debounced,
          status: "active",
          limit: 12,
          page: 1,
        }),
        productsApi.list({
          barcode: debounced,
          status: "active",
          limit: 12,
          page: 1,
        }),
      ]);
      const merged = new Map();
      requests.forEach((request) => {
        if (request.status !== "fulfilled") return;
        (request.value.data.docs || []).forEach((product) =>
          merged.set(product._id, product),
        );
      });
      return { docs: [...merged.values()].slice(0, 12) };
    },
    onError: () => toast.error("Search failed"),
  });

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const results = data?.docs || [];

  return (
    <div className="pos-search-backdrop" onMouseDown={onClose}>
      <div
        className="pos-search-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="pos-search-head">
          <input
            ref={inputRef}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search product name, SKU, or barcode"
          />
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="pos-search-results">
          {isFetching && <div className="pos-empty">Searching...</div>}
          {!isFetching && debounced && results.length === 0 && (
            <div className="pos-empty">No products found</div>
          )}
          {!debounced && (
            <div className="pos-empty">Start typing to search products</div>
          )}
          {results.map((product) => (
            <div className="pos-search-item" key={product._id}>
              <ProductImage product={product} className="pos-search-img" />
              <div>
                <strong>{product.name}</strong>
                <span>
                  {product.sku || "No SKU"} / Stock {product.currentStock || 0}
                </span>
              </div>
              <b>{formatCurrency(getProductPrice(product))}</b>
              <button
                type="button"
                disabled={Number(product.currentStock || 0) <= 0}
                onClick={() => onAdd(product)}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomerSelector({ session, onPatch }) {
  const qc = useQueryClient();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "" });
  const debounced = useDebouncedValue(term);

  const { data } = useQuery({
    queryKey: ["pos-customers", debounced],
    enabled: open && debounced.trim().length > 0,
    queryFn: () =>
      partiesApi
        .list({ type: "customer", search: debounced, limit: 8 })
        .then((res) => res.data.docs || []),
    onError: () => toast.error("Customer search failed"),
  });

  const createCustomer = useMutation({
    mutationFn: () =>
      partiesApi.create({ ...draft, type: "customer" }).then((res) => res.data),
    onSuccess: (party) => {
      onPatch({ customer: party });
      setAdding(false);
      setOpen(false);
      setTerm("");
      setDraft({ name: "", phone: "" });
      qc.invalidateQueries({ queryKey: ["pos-customers"] });
      toast.success("Customer created");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Could not create customer"),
  });

  return (
    <section className="pos-panel-section pos-customer">
      <label>CUSTOMER</label>
      <input
        value={term}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setTerm(event.target.value);
          setOpen(true);
        }}
        placeholder="Search by name"
      />
      {open && (
        <div className="pos-customer-menu">
          {(data || []).map((party) => (
            <button
              type="button"
              key={party._id}
              onClick={() => {
                onPatch({ customer: party });
                setOpen(false);
                setTerm("");
              }}
            >
              <strong>{party.name}</strong>
              <span>{party.phone}</span>
            </button>
          ))}
          {debounced && (data || []).length === 0 && (
            <div className="pos-customer-empty">No customers found</div>
          )}
          <button
            type="button"
            className="pos-create-customer"
            onClick={() => setAdding(true)}
          >
            Create New Customer
          </button>
        </div>
      )}
      <AnimatePresence>
        {adding && (
          <motion.div
            className="pos-quick-add"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <input
              value={draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
              placeholder="Name"
            />
            <input
              value={draft.phone}
              onChange={(event) =>
                setDraft({ ...draft, phone: event.target.value })
              }
              placeholder="Phone"
            />
            <div>
              <button
                type="button"
                disabled={
                  !draft.name || !draft.phone || createCustomer.isPending
                }
                onClick={() => createCustomer.mutate()}
              >
                Create
              </button>
              <button type="button" onClick={() => setAdding(false)}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {session.customer && (
        <div className="pos-selected-customer">
          <span>✓</span>
          <strong>{session.customer.name}</strong>
          <small>{session.customer.phone}</small>
        </div>
      )}
    </section>
  );
}

function CartPanel({
  sessions,
  activeSession,
  setActiveId,
  addSession,
  closeSession,
  renameSession,
  patchSession,
  updateQty,
  removeItem,
  clearCart,
  totals,
  onCheckout,
  checkoutLoading,
}) {
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [taxOpen, setTaxOpen] = useState(false);

  return (
    <aside className="pos-right-panel">
      <div className="pos-session-tabs">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`pos-session-tab ${session.id === activeSession.id ? "active" : ""}`}
          >
            {renaming === session.id ? (
              <input
                value={renameValue}
                autoFocus
                onChange={(event) => setRenameValue(event.target.value)}
                onBlur={() => {
                  renameSession(session.id, renameValue || session.label);
                  setRenaming(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    renameSession(session.id, renameValue || session.label);
                    setRenaming(null);
                  }
                }}
              />
            ) : (
              <button
                type="button"
                className="pos-tab-main"
                onClick={() => setActiveId(session.id)}
              >
                <span>{session.label}</span>
                <b>{session.cart.reduce((sum, item) => sum + item.qty, 0)}</b>
              </button>
            )}
            <button
              type="button"
              className="pos-tab-icon"
              onClick={() => {
                setRenameValue(session.label);
                setRenaming(session.id);
              }}
              title="Rename"
            >
              ✎
            </button>
            <button
              type="button"
              className="pos-tab-icon"
              onClick={() => closeSession(session.id)}
              title="Close"
            >
              x
            </button>
          </div>
        ))}
        <button type="button" className="pos-add-session" onClick={addSession}>
          +
        </button>
      </div>

      <CustomerSelector session={activeSession} onPatch={patchSession} />

      <section className="pos-cart">
        <div className="pos-cart-head">
          <h3>
            Cart{" "}
            <span>
              {activeSession.cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          </h3>
          <button
            type="button"
            onClick={clearCart}
            disabled={!activeSession.cart.length}
          >
            Clear
          </button>
        </div>
        <div className="pos-cart-list">
          {!activeSession.cart.length && (
            <div className="pos-cart-empty">
              <span>□</span>
              <p>Cart is empty</p>
            </div>
          )}
          {activeSession.cart.map((item) => (
            <div className="pos-cart-item" key={item.product._id}>
              <ProductImage product={item.product} className="pos-cart-img" />
              <div className="pos-cart-info">
                <strong>{item.product.name}</strong>
                <small>{formatCurrency(item.price)}</small>
                <div className="pos-stepper">
                  <button
                    type="button"
                    onClick={() => updateQty(item.product._id, item.qty - 1)}
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.product._id, item.qty + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="pos-line-total">
                <button
                  type="button"
                  onClick={() => removeItem(item.product._id)}
                >
                  x
                </button>
                <b>{formatCurrency(item.price * item.qty)}</b>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pos-panel-section pos-adjustments">
        <div>
          <label>DISCOUNT</label>
          <input
            type="number"
            min="0"
            max={totals.subtotal}
            value={activeSession.discount}
            onChange={(event) =>
              patchSession({
                discount: Math.min(
                  Number(event.target.value || 0),
                  totals.subtotal,
                ),
              })
            }
          />
        </div>
        <div className="pos-tax-wrap">
          <label>TAX</label>
          <button
            type="button"
            className="pos-tax-toggle"
            onClick={() => setTaxOpen((value) => !value)}
          >
            {activeSession.taxes.length
              ? `${activeSession.taxes.length} selected`
              : "Select taxes"}
          </button>
          {taxOpen && (
            <div className="pos-tax-menu">
              {TAX_OPTIONS.map((tax) => {
                const checked = activeSession.taxes.some(
                  (item) => item.id === tax.id,
                );
                return (
                  <label key={tax.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        patchSession({
                          taxes: checked
                            ? activeSession.taxes.filter(
                                (item) => item.id !== tax.id,
                              )
                            : [...activeSession.taxes, tax],
                        });
                      }}
                    />
                    <span>
                      {tax.name} {tax.rate}%
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        <div className="pos-tax-chips">
          {activeSession.taxes.map((tax) => (
            <button
              type="button"
              key={tax.id}
              onClick={() =>
                patchSession({
                  taxes: activeSession.taxes.filter(
                    (item) => item.id !== tax.id,
                  ),
                })
              }
            >
              {tax.name} {tax.rate}% x
            </button>
          ))}
        </div>
        <div className="pos-note-field">
          <label>NOTE</label>
          <input
            value={activeSession.note}
            onChange={(event) => patchSession({ note: event.target.value })}
            placeholder="Optional note"
          />
        </div>
      </section>

      <section className="pos-payment">
        {[
          ["cash", "$", "Cash"],
          ["card", "▣", "Card"],
          ["upi", "@", "UPI"],
          ["online", "↗", "Online"],
        ].map(([id, icon, label]) => (
          <button
            type="button"
            key={id}
            className={activeSession.payment === id ? "active" : ""}
            onClick={() => patchSession({ payment: id })}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </section>

      <section className="pos-totals">
        <div>
          <span>Subtotal</span>
          <b>{formatCurrency(totals.subtotal)}</b>
        </div>
        {totals.discount > 0 && (
          <div className="danger">
            <span>Discount</span>
            <b>-{formatCurrency(totals.discount)}</b>
          </div>
        )}
        {totals.taxRows.map((row) => (
          <div key={row.id}>
            <span>
              {row.name} ({row.rate}%)
            </span>
            <b>{formatCurrency(row.amount)}</b>
          </div>
        ))}
        <hr />
        <div className="grand">
          <span>Grand Total</span>
          <b>{formatCurrency(totals.grandTotal)}</b>
        </div>
      </section>

      <button
        type="button"
        className="pos-checkout"
        disabled={!activeSession.cart.length || checkoutLoading}
        onClick={onCheckout}
      >
        {checkoutLoading
          ? "Processing..."
          : `Save & Print - ${formatCurrency(totals.grandTotal)}`}
      </button>
    </aside>
  );
}

export default function SaleForm() {
  const user = useAuthStore((state) => state.user);
  const qc = useQueryClient();
  const [sessions, setSessions] = useState([makeSession(1)]);
  const [activeId, setActiveId] = useState(() => sessions[0].id);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [subExpanded, setSubExpanded] = useState(false);
  const [sort, setSort] = useState("best");
  const [page, setPage] = useState(1);
  const [detailProduct, setDetailProduct] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("pos-dark-mode") === "true",
  );
  const barcodeBuffer = useRef({ value: "", startedAt: 0, lastAt: 0 });

  const activeSession =
    sessions.find((session) => session.id === activeId) || sessions[0];

  const { data: settings } = useQuery({
    queryKey: ["pos-settings-tax"],
    queryFn: () => settingsApi.getTax().then((res) => res.data),
  });

  const taxApplied = useRef(false);
  useEffect(() => {
    if (taxApplied.current || !settings?.defaultGstRate) return;
    const defaultTax = TAX_OPTIONS.find(
      (tax) => tax.rate === Number(settings.defaultGstRate),
    );
    if (defaultTax) {
      taxApplied.current = true;
      setSessions((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, taxes: [defaultTax] } : s)),
      );
    }
  }, [settings?.defaultGstRate]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["pos-categories"],
    queryFn: () =>
      categoriesApi
        .list()
        .then((res) =>
          Array.isArray(res.data) ? res.data : res.data.docs || [],
        ),
    onError: () => toast.error("Could not load categories"),
  });

  const { data: allSubs = [] } = useQuery({
    queryKey: ["pos-subcategories-all"],
    queryFn: () =>
      categoriesApi
        .listSubs()
        .then((res) =>
          Array.isArray(res.data) ? res.data : res.data.docs || [],
        ),
    onError: () => toast.error("Could not load subcategories"),
  });

  const { data: countCatalog } = useQuery({
    queryKey: ["pos-products-count-catalog"],
    queryFn: () =>
      productsApi
        .list({ status: "active", limit: 1000, page: 1 })
        .then((res) => res.data.docs || []),
  });

  const { data: recentSales = [] } = useQuery({
    queryKey: ["pos-recent-sales"],
    queryFn: () =>
      invoicesApi
        .list({ type: "sale", limit: 200, page: 1 })
        .then((res) => res.data.docs || []),
  });

  const {
    data: productPage,
    isLoading: productsLoading,
    isFetching,
  } = useQuery({
    queryKey: ["pos-products", page, selectedCategory, selectedSubcategory],
    queryFn: () =>
      productsApi
        .list({
          page,
          limit: PAGE_SIZE,
          status: "active",
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedSubcategory && { subcategory: selectedSubcategory }),
        })
        .then((res) => res.data),
    onError: () => toast.error("Could not load products"),
    keepPreviousData: true,
  });

  const products = useMemo(() => {
    const docs = [...(productPage?.docs || [])];
    const salesCount = {};
    recentSales.forEach((invoice) => {
      invoice.lineItems?.forEach((item) => {
        const productId = getId(item.product);
        if (productId)
          salesCount[productId] =
            (salesCount[productId] || 0) + Number(item.qty || 0);
      });
    });
    if (sort === "latest")
      return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "price-asc")
      return docs.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    if (sort === "price-desc")
      return docs.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    if (sort === "az") return docs.sort((a, b) => a.name.localeCompare(b.name));
    return docs.sort(
      (a, b) => (salesCount[b._id] || 0) - (salesCount[a._id] || 0),
    );
  }, [productPage?.docs, recentSales, sort]);

  const counts = useMemo(() => {
    const categoryCounts = {};
    const subCounts = {};
    (countCatalog || []).forEach((product) => {
      const categoryId = getId(product.category);
      const subId = getId(product.subcategory);
      if (categoryId)
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      if (subId) subCounts[subId] = (subCounts[subId] || 0) + 1;
    });
    return { categoryCounts, subCounts, total: countCatalog?.length || 0 };
  }, [countCatalog]);

  const visibleCategories = categoryExpanded
    ? categories
    : categories.slice(0, 8);
  const scopedSubs = selectedCategory
    ? allSubs.filter(
        (sub) => (sub.categoryId?._id || sub.categoryId) === selectedCategory,
      )
    : [...allSubs].sort(
        (a, b) =>
          (counts.subCounts[b._id] || 0) - (counts.subCounts[a._id] || 0),
      );
  const visibleSubs = subExpanded ? scopedSubs : scopedSubs.slice(0, 8);

  const totals = useMemo(() => {
    const subtotal = activeSession.cart.reduce(
      (sum, item) => sum + item.qty * item.price,
      0,
    );
    const discount = Math.min(Number(activeSession.discount || 0), subtotal);
    const taxable = Math.max(subtotal - discount, 0);
    const taxRows = activeSession.taxes.map((tax) => ({
      ...tax,
      amount: taxable * (tax.rate / 100),
    }));
    const taxTotal = taxRows.reduce((sum, row) => sum + row.amount, 0);
    return {
      subtotal,
      discount,
      taxable,
      taxRows,
      taxTotal,
      grandTotal: taxable + taxTotal,
    };
  }, [activeSession]);

  useEffect(() => {
    localStorage.setItem("pos-dark-mode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }

      const target = event.target;
      const isTyping =
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName) ||
        target?.isContentEditable;
      if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

      const now = Date.now();
      const buffer = barcodeBuffer.current;
      if (now - buffer.lastAt > 80) buffer.value = "";
      buffer.lastAt = now;
      if (!buffer.startedAt) buffer.startedAt = now;

      if (event.key === "Enter") {
        const value = buffer.value;
        const duration = now - buffer.startedAt;
        buffer.value = "";
        buffer.startedAt = 0;
        if (value.length >= 4 && duration < 900) handleBarcode(value);
        return;
      }
      if (event.key.length === 1) buffer.value += event.key;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [countCatalog, activeId]);

  function patchActiveSession(patch) {
    setSessions((current) =>
      current.map((session) =>
        session.id === activeId ? { ...session, ...patch } : session,
      ),
    );
  }

  function updateActiveSession(updater) {
    setSessions((current) =>
      current.map((session) =>
        session.id === activeId ? updater(session) : session,
      ),
    );
  }

  function addToCart(product) {
    if (Number(product.currentStock || 0) <= 0) {
      toast.error("Product is out of stock");
      return;
    }
    updateActiveSession((session) => {
      const existing = session.cart.find(
        (item) => item.product._id === product._id,
      );
      if (existing) {
        return {
          ...session,
          cart: session.cart.map((item) =>
            item.product._id === product._id
              ? {
                  ...item,
                  qty: Math.min(
                    item.qty + 1,
                    Number(product.currentStock || item.qty + 1),
                  ),
                }
              : item,
          ),
        };
      }
      return {
        ...session,
        cart: [
          ...session.cart,
          { product, qty: 1, price: getProductPrice(product) },
        ],
      };
    });
    toast.success(`${product.name} added`);
  }

  function handleBarcode(code) {
    const found = (countCatalog || []).find((product) =>
      productMatchesCode(product, code),
    );
    if (found) addToCart(found);
    else toast.error(`No product found for ${code}`);
  }

  function updateQty(productId, qty) {
    updateActiveSession((session) => ({
      ...session,
      cart:
        qty <= 0
          ? session.cart.filter((item) => item.product._id !== productId)
          : session.cart.map((item) => {
              if (item.product._id !== productId) return item;
              return {
                ...item,
                qty: Math.min(qty, Number(item.product.currentStock || qty)),
              };
            }),
    }));
  }

  function removeItem(productId) {
    updateActiveSession((session) => ({
      ...session,
      cart: session.cart.filter((item) => item.product._id !== productId),
    }));
  }

  const checkout = useMutation({
    mutationFn: () => {
      if (!activeSession.customer?._id)
        throw new Error("Select or create a customer before checkout");
      if (!activeSession.cart.length) throw new Error("Cart is empty");
      const paymentModeMap = {
        cash: "cash",
        card: "bank_transfer",
        upi: "upi",
        online: "bank_transfer",
      };
      const selectedTaxRate = activeSession.taxes.reduce(
        (sum, tax) => sum + Number(tax.rate || 0),
        0,
      );
      return invoicesApi.create({
        type: "sale",
        party: activeSession.customer._id,
        date: new Date().toISOString().slice(0, 10),
        paymentMode: paymentModeMap[activeSession.payment] || "cash",
        amountPaid: totals.grandTotal,
        status: "paid",
        notes: activeSession.note || "",
        lineItems: activeSession.cart.map((item) => {
          const base = item.price * item.qty;
          const discountShare =
            totals.subtotal > 0
              ? (base / totals.subtotal) * totals.discount
              : 0;
          return {
            product: item.product._id,
            name: item.product.name,
            hsn: item.product.hsnCode || "",
            qty: item.qty,
            unit: item.product.unit?.symbol || item.product.unit?.name || "",
            rate: item.price,
            discount: Number(discountShare.toFixed(2)),
            discountType: "flat",
            gstRate: selectedTaxRate || Number(item.product.gstRate) || 0,
            amount: base,
          };
        }),
        roundOff: 0,
      });
    },
    onSuccess: () => {
      toast.success("Sale saved successfully");
      updateActiveSession((session) => ({
        ...session,
        cart: [],
        discount: 0,
        note: "",
        taxes: [],
      }));
      taxApplied.current = false;
      qc.invalidateQueries({ queryKey: ["pos-products"] });
      qc.invalidateQueries({ queryKey: ["pos-products-count-catalog"] });
      qc.invalidateQueries({ queryKey: ["pos-recent-sales"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || error.message || "Checkout failed",
      ),
  });

  function addSession() {
    const next = makeSession(sessions.length + 1);
    setSessions((current) => [...current, next]);
    setActiveId(next.id);
  }

  function closeSession(id) {
    setSessions((current) => {
      if (current.length === 1) return current;
      const next = current.filter((session) => session.id !== id);
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
  }

  function renameSession(id, label) {
    setSessions((current) =>
      current.map((session) =>
        session.id === id ? { ...session, label } : session,
      ),
    );
  }

  const totalPages = productPage?.totalPages || 1;

  return (
    <div className={`pos-page ${darkMode ? "dark" : ""}`}>
      <style>{POS_STYLES}</style>
      <main className="pos-left-panel">
        <header className="pos-topbar">
          <div className="pos-brand">
            <span>{user?.businessName?.[0] || "E"}</span>
            <strong>{user?.businessName || "ESP Store"}</strong>
          </div>
          <nav className="pos-breadcrumb">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("");
                setSelectedSubcategory("");
              }}
            >
              Home
            </button>
            <span>/</span>
            <button type="button" onClick={() => setSelectedSubcategory("")}>
              {categories.find((cat) => cat._id === selectedCategory)?.name ||
                "Category"}
            </button>
            <span>/</span>
            <button type="button">
              {allSubs.find((sub) => sub._id === selectedSubcategory)?.name ||
                "Subcategory"}
            </button>
          </nav>
          <div className="pos-top-actions">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title="Search"
            >
              ⌕
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              title="Dark mode"
            >
              {darkMode ? "☼" : "◐"}
            </button>
          </div>
        </header>

        <section className="pos-chip-section">
          <div className="pos-section-head">
            <h2>Categories</h2>
            <button
              type="button"
              onClick={() => setCategoryExpanded((value) => !value)}
            >
              {categoryExpanded ? "Show Less" : "View All"}
            </button>
          </div>
          <div className="pos-chip-row">
            <button
              type="button"
              className={`pos-category-chip ${!selectedCategory ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory("");
                setSelectedSubcategory("");
                setPage(1);
              }}
            >
              <span className="pos-chip-avatar">A</span>
              <span>All Products</span>
              <b>{counts.total}</b>
            </button>
            {categoriesLoading && (
              <span className="pos-loading-chip">Loading...</span>
            )}
            {visibleCategories.map((category) => (
              <button
                type="button"
                key={category._id}
                className={`pos-category-chip ${selectedCategory === category._id ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(category._id);
                  setSelectedSubcategory("");
                  setPage(1);
                }}
              >
                {category.image ? (
                  <img src={category.image} alt="" />
                ) : (
                  <span className="pos-chip-avatar">
                    {category.name.slice(0, 1)}
                  </span>
                )}
                <span>{category.name}</span>
                <b>{counts.categoryCounts[category._id] || 0}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="pos-chip-section compact">
          <div className="pos-section-head">
            <h2>Subcategories</h2>
            <button
              type="button"
              onClick={() => setSubExpanded((value) => !value)}
            >
              {subExpanded ? "Show Less" : "View All"}
            </button>
          </div>
          <div className="pos-chip-row">
            {visibleSubs.length === 0 && (
              <span className="pos-muted">No subcategories yet</span>
            )}
            {visibleSubs.map((sub) => (
              <button
                type="button"
                key={sub._id}
                className={`pos-sub-chip ${selectedSubcategory === sub._id ? "active" : ""}`}
                onClick={() => {
                  setSelectedSubcategory(
                    selectedSubcategory === sub._id ? "" : sub._id,
                  );
                  setPage(1);
                }}
              >
                {sub.image && <img src={sub.image} alt="" />}
                <span>{sub.name}</span>
                <b>{counts.subCounts[sub._id] || 0}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="pos-products-section">
          <div className="pos-section-head">
            <h2>Products</h2>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="best">Best Selling</option>
              <option value="latest">Latest</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="az">A→Z</option>
            </select>
          </div>
          <div className="pos-products-grid">
            {(productsLoading || isFetching) &&
              Array.from({ length: 12 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            {!productsLoading &&
              !isFetching &&
              products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAdd={addToCart}
                  onOpen={setDetailProduct}
                />
              ))}
          </div>
          {!productsLoading && !isFetching && !products.length && (
            <div className="pos-empty-state">
              <span>⌁</span>
              <p>No products match this selection</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="pos-pagination">
              {Array.from({ length: totalPages }).map((_, index) => {
                const value = index + 1;
                return (
                  <button
                    type="button"
                    key={value}
                    className={page === value ? "active" : ""}
                    onClick={() => setPage(value)}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <CartPanel
        sessions={sessions}
        activeSession={activeSession}
        setActiveId={setActiveId}
        addSession={addSession}
        closeSession={closeSession}
        renameSession={renameSession}
        patchSession={patchActiveSession}
        updateQty={updateQty}
        removeItem={removeItem}
        clearCart={() => patchActiveSession({ cart: [] })}
        totals={totals}
        onCheckout={() => checkout.mutate()}
        checkoutLoading={checkout.isPending}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAdd={addToCart}
      />
      <ProductModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAdd={addToCart}
      />
    </div>
  );
}

const POS_STYLES = `
  .pos-page {
    --pos-bg: #eef2f8;
    --pos-card: #ffffff;
    --pos-soft: #f8fafc;
    --pos-border: #dbe3ef;
    --pos-text: #102033;
    --pos-muted: #66768a;
    --pos-primary: #4f46e5;
    --pos-primary-dark: #3730a3;
    --pos-purple: #9333ea;
    --pos-danger: #dc2626;
    --pos-warning: #d97706;
    --pos-success: #16a34a;
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    background: var(--pos-bg);
    color: var(--pos-text);
    overflow: hidden;
  }
  .pos-page.dark {
    --pos-bg: #111827;
    --pos-card: #182235;
    --pos-soft: #111827;
    --pos-border: #29374d;
    --pos-text: #e5edf7;
    --pos-muted: #9aa9bd;
    --pos-primary: #818cf8;
    --pos-primary-dark: #6366f1;
    --pos-purple: #c084fc;
  }
  .pos-page button, .pos-page input, .pos-page select { font: inherit; }
  .pos-left-panel { flex: 1; min-width: 0; overflow-y: auto; padding: 16px 18px 24px; }
  .pos-topbar {
    position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 18px;
    padding: 12px; margin: -16px -18px 16px; background: color-mix(in srgb, var(--pos-card) 94%, transparent);
    border-bottom: 1px solid var(--pos-border); backdrop-filter: blur(12px);
  }
  .pos-brand { display: flex; align-items: center; gap: 10px; min-width: 180px; }
  .pos-brand span { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 8px; background: var(--pos-primary); color: #fff; font-weight: 800; }
  .pos-brand strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pos-breadcrumb { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; color: var(--pos-muted); }
  .pos-breadcrumb button { border: 0; background: transparent; color: inherit; padding: 4px; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pos-breadcrumb button:hover { color: var(--pos-primary); }
  .pos-breadcrumb.small { font-size: 12px; }
  .pos-top-actions { display: flex; gap: 8px; }
  .pos-top-actions button {
    width: 38px; height: 38px; border-radius: 8px; border: 1px solid var(--pos-border);
    background: var(--pos-card); color: var(--pos-text); font-size: 18px;
  }
  .pos-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
  .pos-section-head h2 { font-size: 15px; letter-spacing: 0; }
  .pos-section-head button { border: 0; background: transparent; color: var(--pos-primary); font-weight: 700; }
  .pos-section-head select {
    width: 160px; border: 1px solid var(--pos-border); border-radius: 8px; padding: 8px 10px;
    background: var(--pos-card); color: var(--pos-text);
  }
  .pos-chip-section, .pos-products-section {
    background: var(--pos-card); border: 1px solid var(--pos-border); border-radius: 8px; padding: 14px; margin-bottom: 14px;
  }
  .pos-chip-section.compact { padding-top: 12px; }
  .pos-chip-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
  .pos-category-chip, .pos-sub-chip {
    border: 1px solid var(--pos-border); background: var(--pos-soft); color: var(--pos-text);
    display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; border-radius: 999px;
  }
  .pos-category-chip { padding: 7px 10px 7px 7px; min-height: 42px; }
  .pos-sub-chip { padding: 6px 10px; min-height: 32px; font-size: 12px; }
  .pos-category-chip img, .pos-sub-chip img, .pos-chip-avatar {
    width: 28px; height: 28px; border-radius: 50%; object-fit: cover; display: grid; place-items: center;
    background: #e0e7ff; color: #312e81; font-weight: 800;
  }
  .pos-sub-chip img { width: 20px; height: 20px; }
  .pos-category-chip b, .pos-sub-chip b {
    min-width: 22px; height: 22px; padding: 0 7px; border-radius: 999px; display: grid; place-items: center;
    background: var(--pos-card); color: var(--pos-muted); font-size: 11px;
  }
  .pos-category-chip.active { background: var(--pos-primary); color: #fff; border-color: var(--pos-primary); }
  .pos-sub-chip.active { background: var(--pos-purple); color: #fff; border-color: var(--pos-purple); }
.pos-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 6px;
}  .pos-product-card {
    min-width: 0; border: 1px solid var(--pos-border); background: var(--pos-card); color: var(--pos-text);
    border-radius: 8px; overflow: hidden; text-align: left; display: flex; flex-direction: column; cursor: pointer;
  }
  .pos-product-card:hover { border-color: var(--pos-primary); box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08); }
.pos-product-media {
  position: relative;
  height: 90px; /* adjust as needed */
  overflow: hidden;
  background: var(--pos-soft);
}  .pos-product-img, .pos-image-fallback { width: 100%; height: 100%; object-fit: cover; transition: transform 0.18s ease; }
  .pos-product-card:hover .pos-product-img { transform: scale(1.06); }
  .pos-image-fallback { display: grid; place-items: center; color: var(--pos-primary); font-weight: 800; font-size: 22px; background: linear-gradient(135deg, #e0f2fe, #eef2ff); }
  .pos-discount { position: absolute; top: 8px; left: 8px; z-index: 2; background: var(--pos-danger); color: #fff; padding: 3px 7px; border-radius: 999px; font-size: 11px; font-weight: 800; }
  .pos-product-body { padding: 10px; display: flex; flex-direction: column; gap: 7px; flex: 1; }
  .pos-sku { color: var(--pos-muted); font-size: 8px; }
  .pos-product-name { min-height: 6px; font-size: 12px; line-height: 1.35; display: -webkit-box;-webkit-box-orient: vertical; overflow: hidden; }
  .pos-price-row { display: flex; align-items: baseline; gap: 6px; color: var(--pos-primary); font-weight: 200; }
  .pos-price-row del { color: var(--pos-muted); font-weight: 500; font-size: 11px; }
  .pos-stock { width: max-content; border-radius: 999px; padding: 3px 7px; font-size: 11px; font-weight: 800; }
  .pos-stock-green { background: #dcfce7; color: #166534; }
  .pos-stock-orange { background: #ffedd5; color: #9a3412; }
  .pos-stock-red { background: #fee2e2; color: #991b1b; }
  .pos-add-btn {
    margin-top: auto; width: 92%; border: 0; border-radius: 8px; padding: 4px; background: var(--pos-primary); color: #fff; font-weight: 200;
  }
  .pos-add-btn:disabled, .pos-checkout:disabled { opacity: 0.55; cursor: not-allowed; background: var(--pos-muted); }
  .pos-skeleton { animation: posPulse 1.2s infinite ease-in-out; background: linear-gradient(90deg, var(--pos-soft), var(--pos-border), var(--pos-soft)); background-size: 200% 100%; }
  .pos-skeleton-card { padding: 10px; gap: 8px; }
  .pos-skeleton-img { aspect-ratio: 1 / 1; border-radius: 8px; }
  .pos-skeleton-line { height: 12px; border-radius: 999px; }
  .pos-skeleton-line.short { width: 45%; }
  .pos-skeleton-line.medium { width: 70%; }
  .pos-skeleton-button { height: 34px; border-radius: 8px; margin-top: auto; }
  @keyframes posPulse { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
  .pos-empty-state, .pos-empty { display: grid; place-items: center; gap: 8px; min-height: 180px; color: var(--pos-muted); text-align: center; }
  .pos-empty-state span { font-size: 34px; }
  .pos-pagination { display: flex; justify-content: center; gap: 6px; margin-top: 16px; flex-wrap: wrap; }
  .pos-pagination button { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--pos-border); background: var(--pos-card); color: var(--pos-text); }
  .pos-pagination button.active { background: var(--pos-primary); color: #fff; border-color: var(--pos-primary); }
  .pos-right-panel {
    width: clamp(380px, 27vw, 430px); flex-shrink: 0; background: var(--pos-card); border-left: 1px solid var(--pos-border);
    display: flex; flex-direction: column; min-height: 0; overflow-y: auto; padding: 8px; gap: 7px;
  }
  .pos-session-tabs { display: flex; align-items: center; gap: 5px; overflow-x: auto; min-height: 34px; }
  .pos-session-tab { display: flex; align-items: center; gap: 2px; border: 1px solid var(--pos-border); border-radius: 8px; background: var(--pos-soft); max-width: 190px; }
  .pos-session-tab.active { background: #eef2ff; border-color: var(--pos-primary); }
  .pos-page.dark .pos-session-tab.active { background: #26304b; }
  .pos-session-tab input { width: 90px; border: 0; background: transparent; padding: 5px 7px; color: var(--pos-text); }
  .pos-tab-main { min-width: 0; display: flex; align-items: center; gap: 5px; border: 0; background: transparent; color: var(--pos-text); padding: 5px 2px 5px 8px; }
  .pos-tab-main span { max-width: 86px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .pos-tab-main b { min-width: 18px; height: 18px; border-radius: 999px; display: grid; place-items: center; background: var(--pos-primary); color: #fff; font-size: 10px; }
  .pos-tab-icon, .pos-add-session { border: 0; background: transparent; color: var(--pos-muted); width: 22px; height: 26px; }
  .pos-add-session { width: 30px; border-radius: 8px; border: 1px dashed var(--pos-border); background: var(--pos-soft); color: var(--pos-primary); font-weight: 900; }
  .pos-panel-section { border: 1px solid var(--pos-border); border-radius: 8px; padding: 7px; background: var(--pos-soft); }
  .pos-panel-section label { display: block; font-size: 10px; font-weight: 900; color: var(--pos-muted); margin-bottom: 4px; letter-spacing: 0.05em; }
  .pos-panel-section input, .pos-customer input {
    width: 100%; border: 1px solid var(--pos-border); border-radius: 8px; padding: 6px 8px; background: var(--pos-card); color: var(--pos-text);
  }
  .pos-customer { position: relative; }
  .pos-customer-menu {
    position: absolute; left: 7px; right: 7px; top: 50px; z-index: 30; background: var(--pos-card);
    border: 1px solid var(--pos-border); border-radius: 8px; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14); overflow: hidden;
  }
  .pos-customer-menu button { width: 100%; border: 0; background: transparent; color: var(--pos-text); padding: 7px 9px; text-align: left; display: flex; flex-direction: column; }
  .pos-customer-menu button:hover { background: var(--pos-soft); }
  .pos-customer-menu span, .pos-customer-empty { color: var(--pos-muted); font-size: 12px; padding: 0 10px 8px; }
  .pos-create-customer { color: var(--pos-primary) !important; font-weight: 800; border-top: 1px solid var(--pos-border) !important; }
  .pos-quick-add { overflow: hidden; display: grid; gap: 6px; margin-top: 6px; }
  .pos-quick-add div { display: flex; gap: 8px; }
  .pos-quick-add button { flex: 1; border: 0; border-radius: 8px; padding: 6px 8px; background: var(--pos-primary); color: #fff; font-weight: 800; }
  .pos-quick-add button + button { background: var(--pos-card); color: var(--pos-text); border: 1px solid var(--pos-border); }
  .pos-selected-customer { display: flex; align-items: center; gap: 6px; margin-top: 6px; color: var(--pos-success); font-size: 12px; min-width: 0; }
  .pos-selected-customer small { color: var(--pos-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pos-cart { flex: 1 1 360px; min-height: 260px; display: flex; flex-direction: column; border: 1px solid var(--pos-border); border-radius: 8px; overflow: hidden; }
  .pos-cart-head { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--pos-border); }
  .pos-cart-head h3 { font-size: 14px; }
  .pos-cart-head span { color: #fff; background: var(--pos-primary); border-radius: 999px; padding: 1px 7px; font-size: 11px; }
  .pos-cart-head button { border: 0; background: transparent; color: var(--pos-danger); font-weight: 800; }
  .pos-cart-list { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 7px; }
  .pos-cart-empty { height: 100%; min-height: 120px; display: grid; place-items: center; align-content: center; color: var(--pos-muted); gap: 8px; }
  .pos-cart-empty span { font-size: 32px; }
  .pos-cart-item { display: grid; grid-template-columns: 48px minmax(0, 1fr) minmax(84px, auto); gap: 10px; padding: 9px; border: 1px solid var(--pos-border); border-radius: 8px; background: var(--pos-card); }
  .pos-cart-img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
  .pos-cart-info { min-width: 0; display: grid; gap: 4px; }
  .pos-cart-info strong { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13px; }
  .pos-cart-info small { color: var(--pos-muted); }
  .pos-stepper { display: inline-flex; width: max-content; border: 1px solid var(--pos-border); border-radius: 7px; overflow: hidden; }
  .pos-stepper button { width: 26px; border: 0; background: var(--pos-soft); color: var(--pos-text); }
  .pos-stepper span { width: 28px; text-align: center; background: var(--pos-card); font-size: 12px; }
  .pos-line-total { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; color: var(--pos-primary); }
  .pos-line-total button { border: 0; background: transparent; color: var(--pos-muted); }
  .pos-adjustments { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; position: relative; }
  .pos-tax-toggle { width: 100%; border: 1px solid var(--pos-border); border-radius: 8px; padding: 6px 8px; background: var(--pos-card); color: var(--pos-text); text-align: left; }
  .pos-tax-menu { position: absolute; right: 7px; bottom: 100%; z-index: 25; width: 160px; border: 1px solid var(--pos-border); border-radius: 8px; padding: 8px; background: var(--pos-card); box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14); }
  .pos-tax-menu label { display: flex; align-items: center; gap: 8px; margin: 0; padding: 6px; color: var(--pos-text); letter-spacing: 0; font-size: 12px; }
  .pos-tax-menu input { width: auto; }
  .pos-tax-chips, .pos-note-field { grid-column: 1 / -1; }
  .pos-tax-chips { display: flex; gap: 5px; flex-wrap: wrap; }
  .pos-tax-chips button { border: 0; border-radius: 999px; padding: 3px 7px; background: #ede9fe; color: #6d28d9; font-size: 10px; }
  .pos-payment { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
  .pos-payment button { min-height: 36px; border: 1px solid var(--pos-border); border-radius: 8px; background: var(--pos-soft); color: var(--pos-text); display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 11px; }
  .pos-payment button span { font-size: 14px; }
  .pos-payment button.active { background: var(--pos-primary); border-color: var(--pos-primary); color: #fff; }
  .pos-totals { border: 1px solid var(--pos-border); border-radius: 8px; padding: 8px; display: grid; gap: 5px; background: var(--pos-soft); }
  .pos-totals div { display: flex; justify-content: space-between; gap: 10px; color: var(--pos-muted); font-size: 12px; }
  .pos-totals b { color: var(--pos-text); }
  .pos-totals .danger b, .pos-totals .danger span { color: var(--pos-danger); }
  .pos-totals hr { border: 0; border-top: 1px solid var(--pos-border); }
  .pos-totals .grand { color: var(--pos-text); font-size: 14px; font-weight: 900; align-items: baseline; }
  .pos-totals .grand b { color: var(--pos-primary); font-size: 18px; }
  .pos-checkout { width: 100%; border: 0; border-radius: 10px; padding: 10px 12px; background: var(--pos-primary); color: #fff; font-weight: 900; }
  .pos-search-backdrop, .pos-modal-backdrop {
    position: fixed; inset: 0; z-index: 400; background: rgba(2, 6, 23, 0.68); display: flex; align-items: flex-start; justify-content: center; padding: 7vh 16px 16px;
  }
  .pos-search-modal { width: min(760px, 100%); max-height: 82vh; overflow: hidden; border-radius: 12px; background: var(--pos-card); color: var(--pos-text); box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25); }
  .pos-search-head { display: flex; gap: 10px; padding: 14px; border-bottom: 1px solid var(--pos-border); }
  .pos-search-head input { flex: 1; border: 1px solid var(--pos-border); border-radius: 8px; padding: 12px; background: var(--pos-soft); color: var(--pos-text); }
  .pos-search-head button, .pos-search-item button { border: 0; border-radius: 8px; padding: 0 14px; background: var(--pos-primary); color: #fff; font-weight: 800; }
  .pos-search-results { max-height: calc(82vh - 72px); overflow-y: auto; padding: 10px; }
  .pos-search-item { display: grid; grid-template-columns: 52px 1fr auto auto; align-items: center; gap: 12px; padding: 10px; border-bottom: 1px solid var(--pos-border); }
  .pos-search-img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; }
  .pos-search-item div { min-width: 0; display: grid; gap: 2px; }
  .pos-search-item strong { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .pos-search-item span { color: var(--pos-muted); font-size: 12px; }
  .pos-product-modal { width: min(620px, 100%); background: var(--pos-card); color: var(--pos-text); border-radius: 12px; overflow: hidden; position: relative; }
  .pos-modal-close { position: absolute; top: 10px; right: 10px; z-index: 2; width: 34px; height: 34px; border: 0; border-radius: 8px; background: rgba(255,255,255,0.9); color: #111827; }
  .pos-detail-image { aspect-ratio: 16 / 9; background: var(--pos-soft); }
  .pos-detail-img { width: 100%; height: 100%; object-fit: cover; }
  .pos-detail-content { padding: 18px; display: grid; gap: 12px; }
  .pos-detail-content h2 { font-size: 22px; line-height: 1.2; }
  .pos-detail-meta { display: flex; flex-wrap: wrap; gap: 8px; color: var(--pos-muted); font-size: 12px; }
  .pos-detail-price { display: flex; align-items: baseline; gap: 10px; }
  .pos-detail-price strong { color: var(--pos-primary); font-size: 24px; }
  .pos-detail-price del, .pos-detail-price span { color: var(--pos-muted); }
  .pos-stock-row { display: flex; align-items: center; justify-content: space-between; }
  .pos-muted, .pos-loading-chip { color: var(--pos-muted); }
  @media (max-width: 940px) {
    .pos-page { flex-direction: column; overflow: auto; }
    .pos-left-panel { overflow: visible; }
    .pos-right-panel { width: 100%; min-height: 620px; border-left: 0; border-top: 1px solid var(--pos-border); }
    .pos-topbar { flex-wrap: wrap; }
    .pos-brand { min-width: 150px; }
  }
  @media (max-width: 560px) {
    .pos-products-grid { grid-template-columns: repeat(auto-fit, minmax(132px, 1fr)); }
    .pos-breadcrumb { order: 3; flex-basis: 100%; }
    .pos-search-item { grid-template-columns: 44px 1fr; }
    .pos-search-item b, .pos-search-item button { grid-column: 2; justify-self: start; min-height: 32px; }
  }
`;
