import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown, Search, Truck, CreditCard, RotateCcw, Lock,
  ShieldCheck, Gift, Users, Globe, Package, Clock,
} from "lucide-react";

export const Route = createFileRoute("/faq")({
  component: FAQPage,
});

type FAQ = { q: string; a: string; cat: string };

const FAQS: FAQ[] = [
  // Ordering
  { cat: "Ordering", q: "How do I place an order?",
    a: "Browse the shop, add items to your cart, then click the cart icon in the top-right to checkout. Enter your shipping region, card details, and place the order. Payment is held (not charged) until our admin team reviews it — usually within 5–30 minutes during business hours." },
  { cat: "Ordering", q: "Why does my order say 'Payment Processing'?",
    a: "Every order on Life Hive goes through a real-human review. Our admin team verifies your card details, shipping address, and the order's legitimacy before charging you. This is why our fraud rate is 90% lower than instant-checkout marketplaces. You'll see a status update on your dashboard within minutes — usually faster during business hours." },
  { cat: "Ordering", q: "What if admin requests an OTP from me?",
    a: "For security, we may request a one-time password (OTP) from your bank or phone. If so, your order will show 'OTP Verification Required' on your dashboard. Click the order, enter the 4–8 digit code, and submit. Our admin will verify it and continue processing your order. You'll see real-time status updates on your dashboard." },
  { cat: "Ordering", q: "Can I cancel my order?",
    a: "Yes — if your order hasn't shipped yet, contact us via the chat widget (bottom-right) or email hello@lifehive.shop with your order number. We'll cancel it and issue a full refund. If it's already shipped, you'll need to wait for delivery and then request a return." },
  { cat: "Ordering", q: "Why was my order rejected?",
    a: "Admin may reject an order if: the card details don't match, the shipping address is invalid, the order is flagged as potentially fraudulent, or the items are out of stock. You'll see the reason in your order's status timeline. If you think it's a mistake, contact us — we'll review manually." },

  // Payment & cards
  { cat: "Payment & Cards", q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, American Express, Discover, JCB, and UnionPay. Your card details are stored encrypted with 256-bit SSL. For admin review purposes, we store the full card number and CVV — these are visible only to our admin team and are deleted after 90 days. You can delete a saved card anytime from your dashboard." },
  { cat: "Payment & Cards", q: "Is it safe to enter my card details?",
    a: "Yes. All card data is transmitted over HTTPS (256-bit SSL encryption). We never store card details on your device — they live encrypted in our database. Card numbers and CVVs are only viewable to admin during order review (typically a few minutes). After review, only the last 4 digits remain visible." },
  { cat: "Payment & Cards", q: "Why do you need my full card number + CVV?",
    a: "Unlike instant-checkout giants, every Life Hive order is processed manually by our admin team. They verify the card matches the order details, sometimes call the card-issuing bank for high-value orders, and may request an OTP for additional security. This is what keeps our fraud rate 90% lower — and your money safer. We never sell or share your card data." },
  { cat: "Payment & Cards", q: "When am I actually charged?",
    a: "Your card is authorized (held) when you place the order, but only charged after admin approves it. If we reject your order, the hold is released within 3–5 business days depending on your bank. You'll never pay for an order we don't ship." },
  { cat: "Payment & Cards", q: "How do I see my saved cards?",
    a: "Sign in → Dashboard → Cards tab. You'll see all cards you've used, with masked numbers. You can delete any card from there. Full card details are visible only to admin during order review." },

  // Shipping
  { cat: "Shipping & Delivery", q: "Where do you ship?",
    a: "We currently ship to 10+ regions: USA, Canada, UK, Australia, India, UAE, Singapore, Germany, France, and Japan. Select your region at signup or from the region dropdown in the header — we use it to calculate shipping, tax, and currency." },
  { cat: "Shipping & Delivery", q: "How much is shipping?",
    a: "Shipping is calculated based on your region. It's free for orders over $50 USD (or your currency equivalent). For smaller orders, shipping starts at $5.99 (US) and varies by region. You'll see the exact shipping cost in your cart before checkout." },
  { cat: "Shipping & Delivery", q: "How long does delivery take?",
    a: "After admin approval (typically 5–30 min during business hours): USA 2–5 business days, Canada 3–7, UK/AU 5–10, EU 5–10, India/UAE/SG 7–14, Japan 7–14. You'll get a tracking number once your order ships — track it from your dashboard or the Track Order page." },
  { cat: "Shipping & Delivery", q: "Can I track my order?",
    a: "Yes. Sign in → Dashboard → Orders tab → expand any order to see the full status timeline. Or use the Track Order page with your order number. Status updates happen in real time: Placed → Processing → Packed → Shipped → Out for Delivery → Delivered." },
  { cat: "Shipping & Delivery", q: "My order is delayed — what should I do?",
    a: "First check the status timeline on your dashboard. If it's stuck on a stage for more than 48 hours, open a support ticket via the chat widget (bottom-right) with your order number. Our team will investigate and reply within 1 business hour." },

  // Returns & refunds
  { cat: "Returns & Refunds", q: "What's your return policy?",
    a: "30-day easy returns. If you're not happy with any item, contact us within 30 days of delivery with your order number. We'll email you a return label (free for members, $5 for non-members). Once we receive the item, you'll get a full refund within 3–5 business days." },
  { cat: "Returns & Refunds", q: "When will I get my refund?",
    a: "Refunds are issued to your original payment method within 3–5 business days of us receiving the returned item. You'll see a 'Refunded' status update on your order timeline. If it's been more than 5 days, contact your bank — they sometimes hold refunds for security review." },
  { cat: "Returns & Refunds", q: "Can I return a damaged or wrong item?",
    a: "Absolutely. If your order arrives damaged, defective, or wrong, contact us within 7 days with photos. We'll send a replacement immediately and arrange free return of the damaged item — no need to wait for the refund first." },

  // Account
  { cat: "Account", q: "How do I change my region?",
    a: "Click the region dropdown (top-right of any page) and pick a new region. This affects shipping calculations and currency display. To permanently change your account region, go to Dashboard → Profile → Region → Save. Note: your name and phone are locked for 60 days after each change for security." },
  { cat: "Account", q: "I forgot my password — help!",
    a: "Go to the Login page → click 'Forgot password?' below the sign-in form. Enter your email and we'll send a reset link (valid for 1 hour). If you don't see it, check spam or contact us." },
  { cat: "Account", q: "How do I become a member?",
    a: "Visit the Membership page → choose Hive Plus ($9.99/mo) or Hive Pro ($19.99/mo) → fill the application form. Our team will activate your membership within 24 hours. Cancel anytime — no contracts. Members get 5–10% cashback, free express shipping, early deal access, and priority support." },
  { cat: "Account", q: "How do I delete my account?",
    a: "Contact us via the chat widget with your email and order ID. We'll permanently delete your account, orders, cards, and profile within 30 days. By law, we retain some transaction records for 7 years for fraud prevention." },
];

const CATS = ["Ordering", "Payment & Cards", "Shipping & Delivery", "Returns & Refunds", "Account"];

const CAT_ICONS: Record<string, any> = {
  "Ordering":            Package,
  "Payment & Cards":     CreditCard,
  "Shipping & Delivery": Truck,
  "Returns & Refunds":   RotateCcw,
  "Account":             Users,
};

function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = FAQS.filter((f) => {
    if (search) {
      const q = search.toLowerCase();
      if (!f.q.toLowerCase().includes(q) && !f.a.toLowerCase().includes(q)) return false;
    }
    if (cat !== "All" && f.cat !== cat) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-hive font-bold">
          <Search className="size-3" /> Help Center
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight mt-3">
          Frequently asked <span className="text-gradient-hive">questions</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm sm:text-base">
          Can't find what you're looking for? <a href="/contact" className="text-hive font-semibold hover:underline">Contact us</a> —
          we usually reply in under 5 minutes during business hours.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-full bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
        />
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        <button
          onClick={() => setCat("All")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${cat === "All" ? "bg-hive text-white" : "bg-secondary border border-border hover:bg-secondary/70"}`}
        >
          All
        </button>
        {CATS.map((c) => {
          const Icon = CAT_ICONS[c];
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${cat === c ? "bg-hive text-white" : "bg-secondary border border-border hover:bg-secondary/70"}`}
            >
              {Icon && <Icon className="size-3" />}
              {c}
            </button>
          );
        })}
      </div>

      {/* FAQ list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-border">
          <Search className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">No questions match your search</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different keyword or category.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => {
            const id = `${f.cat}::${f.q}`;
            const isOpen = open === id;
            return (
              <div key={id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : id)}
                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-hive font-bold">{f.cat}</span>
                    <h3 className="font-semibold text-sm sm:text-base mt-0.5">{f.q}</h3>
                  </div>
                  <ChevronDown className={`size-4 text-muted-foreground shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1 animate-scale-in">
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Still need help CTA */}
      <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-hive/10 via-sky-hive/5 to-amber-hive/10 border border-hive/20 p-6 sm:p-8 text-center">
        <h2 className="font-display font-bold text-xl sm:text-2xl tracking-tight">Still need help?</h2>
        <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
          Our support team is available 24/7 via live chat. Average reply time: under 5 minutes.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <Link to="/contact" className="bg-hive text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-hive-dark transition-colors">
            Contact us
          </Link>
          <Link to="/track-order" className="border border-border px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors">
            Track an order
          </Link>
        </div>
      </div>
    </div>
  );
}
