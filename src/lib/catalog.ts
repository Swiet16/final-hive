// Curated catalog metadata used across admin form and filters.
// Updated for Life Hive — multi-category "everything is here" store.
// Schema stays the same (products.category is just a text column),
// only the option list shown in the admin form changes.

export const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion",     label: "Fashion" },
  { value: "home",        label: "Home & Living" },
  { value: "beauty",      label: "Beauty & Health" },
  { value: "sports",      label: "Sports & Outdoor" },
  { value: "grocery",     label: "Grocery & Gourmet" },
  { value: "toys",        label: "Toys & Baby" },
  { value: "books",       label: "Books & Stationery" },
  { value: "auto",        label: "Automotive" },
  { value: "garden",      label: "Garden & Outdoor" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const BRANDS_BY_CATEGORY: Record<CategoryValue, string[]> = {
  electronics: ["Aurora", "Pulse", "ZenBook", "Mecha", "Flash", "Boost", "Samsung", "Apple", "Sony", "Bose", "Anker", "Logitech"],
  fashion:     ["Coast", "Trail", "Artisan", "Northwind", "Levi's", "Nike", "Adidas", "Zara", "H&M", "Uniqlo", "Patagonia"],
  home:        ["Lumina", "ErgoLab", "Hearth", "ZenHome", "IKEA", "Dyson", "Philips", "Casper", "KitchenAid"],
  beauty:      ["Glow", "Hydra", "Velvet", "The Ordinary", "L'Oréal", "Maybelline", "Neutrogena", "CeraVe", "Fenty"],
  sports:      ["ZenFit", "IronCore", "Aero", "Nike", "Adidas", "Under Armour", "Decathlon", "Wilson", "Callaway"],
  grocery:     ["Bean Lab", "Hive Pure", "Nestlé", "Quaker", "Kellogg's", "Heinz", "Organic Valley", "Lavazza"],
  toys:        ["LittleHands", "CuddleCo", "LEGO", "Mattel", "Hasbro", "Fisher-Price", "Melissa & Doug"],
  books:       ["Penguin", "HarperCollins", "Scholastic", "Cal Newport", "James Clear", "Simon Sinek"],
  auto:        ["RoadEye", "CleanRide", "Bosch", "Michelin", "Castrol", "Mobil 1", "WeatherTech", "Garmin"],
  garden:      ["Sprout", "GreenThumb", "Scotts", "Miracle-Gro", "Fiskars", "Black+Decker"],
};

// ───────────────────────────────────────────────────────────────────
// Order status pipeline — 22 stages.
// Each stage has: key, label, color (for pill), icon name, description.
// Used by admin (manage orders), customer dashboard, track-order page.
// ───────────────────────────────────────────────────────────────────
export const ORDER_STAGES = [
  // Payment & verification
  { key: "pending",          label: "Order Placed",        desc: "We've received your order",            color: "amber"   },
  { key: "payment_processing", label: "Payment Processing", desc: "Card being charged — please wait",    color: "sky"    },
  { key: "otp_required",     label: "OTP Verification",    desc: "We need an OTP from you to proceed",    color: "violet"  },
  { key: "otp_verified",     label: "OTP Verified",         desc: "Your OTP was confirmed by admin",      color: "indigo"  },
  { key: "confirmed",        label: "Confirmed",            desc: "Payment verified & order approved",    color: "sky"    },
  { key: "review_declined", label: "Review Declined",     desc: "Order rejected by admin — see note",    color: "rose"    },
  { key: "fraud_check",      label: "Fraud Check",          desc: "Order flagged for manual review",       color: "amber"   },
  // Fulfillment
  { key: "processing",      label: "Processing",           desc: "Picking items from warehouse",          color: "indigo"  },
  { key: "quality_check",   label: "Quality Check",        desc: "Items inspected before packing",        color: "violet"  },
  { key: "packing",         label: "Packing",               desc: "Order being carefully packed",         color: "violet"  },
  { key: "ready_to_ship",   label: "Ready to Ship",         desc: "Packed & waiting for courier pickup",    color: "violet"  },
  // Shipping
  { key: "shipped",         label: "Shipped",               desc: "On the way to your address",            color: "violet"  },
  { key: "in_transit",      label: "In Transit",            desc: "Moving through courier network",        color: "violet"  },
  { key: "out_for_delivery", label: "Out for Delivery",     desc: "Courier is on the way to you today",    color: "violet"  },
  // Delivery
  { key: "delivered",       label: "Delivered",             desc: "Successfully delivered to your address", color: "emerald" },
  { key: "delivery_failed", label: "Delivery Failed",      desc: "Courier couldn't deliver — see note",  color: "rose"    },
  { key: "returned",       label: "Returned to Sender",   desc: "Package sent back to warehouse",         color: "rose"    },
  // Post-delivery
  { key: "return_requested", label: "Return Requested",    desc: "Customer asked to return item(s)",      color: "amber"   },
  { key: "return_approved", label: "Return Approved",      desc: "Return authorized — ship it back",       color: "sky"    },
  { key: "refunded",        label: "Refunded",              desc: "Money returned to your card",            color: "zinc"    },
  // Cancelled
  { key: "cancelled",       label: "Cancelled",             desc: "Order cancelled",                       color: "zinc"    },
  { key: "on_hold",         label: "On Hold",                desc: "Paused — admin will follow up",         color: "amber"   },
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number]["key"];
export type OrderStageKey = OrderStage;

export function stageIndex(status: string): number {
  const i = ORDER_STAGES.findIndex((s) => s.key === status.toLowerCase());
  return i < 0 ? 0 : i;
}

export function stageInfo(status: string | undefined | null) {
  if (!status) return ORDER_STAGES[0];
  return ORDER_STAGES.find((s) => s.key === status.toLowerCase()) ?? ORDER_STAGES[0];
}

// Color classes used by the StatusPill component (mapped by stage.color)
export const STAGE_COLOR_CLASSES: Record<string, string> = {
  amber:   "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  sky:     "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  indigo:  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  violet:  "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  rose:    "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  zinc:    "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
};

// Helper to validate category
export function isValidCategory(c: string | undefined | null): c is CategoryValue {
  return !!c && CATEGORIES.some((x) => x.value === c);
}
