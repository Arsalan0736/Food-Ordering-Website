"use client";

import { gql } from "@apollo/client";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "./context";
import { getApolloClient } from "./apolloClient";
import Image from "next/image";
import {
  Compass,
  ShoppingCart,
  FileText,
  Settings,
  Bell,
  Inbox,
  LogOut,
  ChevronDown,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";

// ─── GraphQL Documents (unchanged) ───────────────────────────────────────────

const GET_USERS = gql`
  query {
    users { id name role country }
  }
`;

const GET_RESTAURANTS = gql`
  query {
    restaurants {
      id name country
      menuItems { id name price }
    }
  }
`;

const GET_ORDERS = gql`
  query {
    orders {
      id status totalAmount
      orderItems {
        quantity
        menuItem { name price }
      }
    }
  }
`;

const PLACE_ORDER = gql`
  mutation PlaceOrder($menuItemIds: [String!]!) {
    placeOrder(menuItemIds: $menuItemIds) {
      id status totalAmount
    }
  }
`;

const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id status
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Maps a menu item name to a food image for visual richness
const getFoodImage = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("burger") || n.includes("beef") || n.includes("chicken"))
    return "/burger.png";
  if (n.includes("donut") || n.includes("doughnut") || n.includes("dessert") || n.includes("sweet"))
    return "/donut.png";
  if (n.includes("shake") || n.includes("drink") || n.includes("juice") || n.includes("boba") || n.includes("tea"))
    return "/shake.png";
  if (n.includes("pizza") || n.includes("pasta") || n.includes("italian"))
    return "/pizza.png";
  return "/burger.png";
};

// Pastel card background colours cycling for menu item grid
const CARD_COLORS = [
  "bg-[#FFF4E8]",
  "bg-[#F0EDFF]",
  "bg-[#E8F7F4]",
  "bg-[#FFF0F2]",
  "bg-[#EEF4FF]",
  "bg-[#FFFBE8]",
];

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-600",
  MANAGER: "bg-blue-100 text-blue-600",
  MEMBER: "bg-green-100 text-green-600",
};

// ─── Login Screen ─────────────────────────────────────────────────────────────

interface LoginScreenProps {
  users: any[];
  selectedId: string;
  onSelect: (id: string) => void;
  onEnter: () => void;
}

function LoginScreen({ users, selectedId, onSelect, onEnter }: LoginScreenProps) {
  const selected = users.find((u) => u.id === selectedId);
  const [open, setOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#DFF0F2] p-4"
      onClick={(e) => {
        if (open && !(e.target as Element).closest('#user-select, .dropdown-list')) {
          setOpen(false);
        }
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#F94C66] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
              <span className="text-2xl">🍔</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400 font-medium tracking-wide">WELCOME TO</p>
              <h1 className="text-2xl font-bold text-slate-800">Food Wisher</h1>
            </div>
          </div>
          <p className="text-slate-500 text-sm">Select your role to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 p-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Simulate Access As
          </p>

          {/* Custom Themed Dropdown */}
          <div className="relative mb-6">
            {/* Trigger button */}
            <button
              id="user-select"
              onClick={() => setOpen(!open)}
              className={`w-full flex items-center gap-3 bg-slate-50 border-2 rounded-2xl px-4 py-3.5 transition-all ${
                open ? "border-[#F94C66] shadow-sm shadow-red-100" : "border-slate-100 hover:border-[#F94C66]/40"
              }`}
            >
              {selected ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F94C66] to-[#ff8fa0] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {selected.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{selected.name}</p>
                    <p className="text-xs text-slate-400">{selected.country || "Global"}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase flex-shrink-0 ${ROLE_BADGE[selected.role] || "bg-slate-100 text-slate-500"}`}>
                    {selected.role}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 text-sm flex-1 text-left">Select a user...</span>
              )}
              <ChevronDown
                size={16}
                className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#F94C66]" : ""}`}
              />
            </button>

            {/* Dropdown list */}
            {open && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/80 overflow-hidden z-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-4 pt-3 pb-1">Choose User</p>
                {users.map((u) => {
                  const isActive = u.id === selectedId;
                  return (
                    <button
                      key={u.id}
                      onClick={() => { onSelect(u.id); setOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-50 last:border-0 ${
                        isActive ? "bg-[#fff0f2]" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-colors ${
                        isActive
                          ? "bg-gradient-to-br from-[#F94C66] to-[#ff8fa0]"
                          : "bg-gradient-to-br from-slate-300 to-slate-400"
                      }`}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${isActive ? "text-[#F94C66]" : "text-slate-700"}`}>
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-400">{u.country || "Global"}</p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase flex-shrink-0 ${
                        u.role === "ADMIN" ? "bg-red-100 text-red-500" :
                        u.role === "MANAGER" ? "bg-blue-100 text-blue-500" :
                        "bg-green-100 text-green-500"
                      }`}>
                        {u.role}
                      </span>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-[#F94C66] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            id="enter-dashboard-btn"
            onClick={onEnter}
            className="w-full bg-[#F94C66] hover:bg-[#e03657] active:scale-[0.98] text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            Enter Dashboard
            <ChevronRight size={18} />
          </button>

          {/* Role Info */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { role: "ADMIN", desc: "Full access", color: "text-red-500" },
              { role: "MANAGER", desc: "Place & Cancel", color: "text-blue-500" },
              { role: "MEMBER", desc: "View only", color: "text-green-500" },
            ].map((r) => (
              <div key={r.role} className="bg-slate-50 rounded-xl p-2">
                <p className={`font-bold ${r.color}`}>{r.role}</p>
                <p className="text-slate-400 mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-[#F94C66]/10 text-[#F94C66]"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      <span className={active ? "text-[#F94C66]" : "text-slate-400"}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className="bg-[#F94C66] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Menu Item Card ───────────────────────────────────────────────────────────

function MenuItemCard({
  item,
  colorClass,
  onAdd,
}: {
  item: any;
  colorClass: string;
  onAdd: () => void;
}) {
  const img = getFoodImage(item.name);
  return (
    <div className={`${colorClass} rounded-2xl p-4 flex flex-col gap-2 group relative`}>
      <div className="flex justify-center items-center h-36 mb-2">
        <Image
          src={img}
          alt={item.name}
          width={130}
          height={130}
          className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <p className="text-slate-700 font-semibold text-sm leading-tight">{item.name}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-slate-800 font-bold text-base">${item.price.toFixed(2)}</span>
        <button
          id={`add-${item.id}`}
          onClick={onAdd}
          className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:bg-[#F94C66] hover:text-white transition-colors"
        >
          <ShoppingCart size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  qty,
  onRemove,
}: {
  item: { name: string; price: number; uiId: number };
  qty: number;
  onRemove: () => void;
}) {
  const img = getFoodImage(item.name);
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <Image src={img} alt={item.name} width={60} height={60} className="object-contain" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-base leading-tight truncate">{item.name}</p>
        <p className="text-slate-400 text-xs mt-0.5">Size : M ♥</p>
        <p className="text-slate-800 font-bold text-base mt-1">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={onRemove}
          className="text-slate-300 hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
        <span className="text-slate-400 text-xs font-semibold">{qty}x</span>
      </div>
    </div>
  );
}

// ─── Order History Item ───────────────────────────────────────────────────────

function OrderHistoryItem({
  order,
  canCancel,
  onCancel,
}: {
  order: any;
  canCancel: boolean;
  onCancel: () => void;
}) {
  const isCompleted = order.status === "COMPLETED";
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isCompleted ? "bg-green-50" : isCancelled ? "bg-red-50" : "bg-yellow-50"
        }`}
      >
        {isCompleted ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : isCancelled ? (
          <XCircle size={16} className="text-red-400" />
        ) : (
          <Clock size={16} className="text-yellow-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">
          #{order.id.substring(0, 8).toUpperCase()}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {order.orderItems?.length} item{order.orderItems?.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-slate-800 font-bold text-xs">${order.totalAmount.toFixed(2)}</span>
        {canCancel && !isCancelled && (
          <button
            onClick={onCancel}
            className="text-[10px] text-red-400 hover:text-red-600 font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface DashboardProps {
  userData: any;
  restData: any;
  ordersData: any;
  cart: { id: string; name: string; price: number; uiId: number }[];
  userId: string;
  currentUser: any;
  onAddToCart: (item: any) => void;
  onRemoveFromCart: (uiId: number) => void;
  onCheckout: () => void;
  onCancelOrder: (id: string) => void;
  onChangeUser: (id: string) => void;
  onLogout: () => void;
}

function Dashboard({
  userData,
  restData,
  ordersData,
  cart,
  userId,
  currentUser,
  onAddToCart,
  onRemoveFromCart,
  onCheckout,
  onCancelOrder,
  onChangeUser,
  onLogout,
}: DashboardProps) {
  const [activeNav, setActiveNav] = useState("discover");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  // Collect all menu items across restaurants for the grid
  const allItems: any[] = [];
  restData?.restaurants?.forEach((r: any) => {
    r.menuItems?.forEach((m: any) => {
      allItems.push({ ...m, restaurantName: r.name, country: r.country });
    });
  });

  // Category filtering (visual only, derived from item names)
  const categories = ["All", "Burger", "Donut", "Pizza", "Shake"];
  const filteredItems =
    activeCategory === "All"
      ? allItems
      : allItems.filter((m) =>
          getFoodImage(m.name) ===
          getFoodImage(activeCategory.toLowerCase())
        );

  // Deduplicate cart for display (group by id, sum qty)
  const cartDisplay: { item: { id: string; name: string; price: number; uiId: number }; qty: number }[] = [];
  const seen = new Map<string, number>();
  cart.forEach((c) => {
    if (seen.has(c.id)) {
      const idx = seen.get(c.id)!;
      cartDisplay[idx].qty += 1;
    } else {
      seen.set(c.id, cartDisplay.length);
      cartDisplay.push({ item: c, qty: 1 });
    }
  });

  const total = cart.reduce((s, c) => s + c.price, 0);
  const canCheckout = currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";
  const pendingOrders = ordersData?.orders?.filter((o: any) => o.status !== "CANCELLED") ?? [];

  return (
    <div className="min-h-screen bg-[#DFF0F2] flex items-center justify-center p-3">
      <div className="w-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 overflow-hidden flex" style={{height: 'calc(100vh - 24px)'}}>

        {/* ── Left Sidebar ── */}
        <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-100 p-6 bg-white">
          {/* User Profile */}
          <div className="flex flex-col items-center text-center mb-8 mt-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F94C66] to-[#ff8fa0] flex items-center justify-center text-white text-3xl font-bold mb-3 ring-4 ring-red-50">
              {currentUser?.name?.charAt(0) || "?"}
            </div>
            <p className="font-bold text-slate-800 text-base leading-tight">{currentUser?.name || "User"}</p>
            <p className="text-slate-400 text-sm mt-0.5">{currentUser?.country || "Global"}</p>
            <span className={`mt-2 text-xs px-3 py-1 rounded-full font-bold uppercase ${ROLE_BADGE[currentUser?.role] || "bg-slate-100 text-slate-500"}`}>
              {currentUser?.role}
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-1">
            <div className="w-[3px] absolute left-[3.5rem] hidden" />
            <NavItem icon={<Compass size={19} />} label="Discover" active={activeNav === "discover"} onClick={() => setActiveNav("discover")} />
            <NavItem icon={<ShoppingCart size={19} />} label="My Cart" active={activeNav === "cart"} badge={cart.length > 0 ? cart.length : undefined} onClick={() => setActiveNav("cart")} />
            <NavItem icon={<FileText size={19} />} label="Orders" active={activeNav === "orders"} badge={pendingOrders.length || undefined} onClick={() => setActiveNav("orders")} />
            <NavItem icon={<Settings size={19} />} label="Settings" active={activeNav === "settings"} onClick={() => setActiveNav("settings")} />
            <NavItem icon={<Bell size={19} />} label="Notifications" active={activeNav === "notifs"} badge={ordersData?.orders?.length > 0 ? ordersData.orders.length : undefined} onClick={() => setActiveNav("notifs")} />
            <NavItem icon={<Inbox size={19} />} label="Inbox" active={activeNav === "inbox"} onClick={() => setActiveNav("inbox")} />
          </nav>

          {/* Custom User Switcher */}
          <div className="mt-4 border-t border-slate-100 pt-4 relative">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 px-1">Switch User</p>
            <button
              onClick={() => setShowUserSwitcher(!showUserSwitcher)}
              className="w-full flex items-center gap-2.5 bg-slate-50 hover:bg-[#fff0f2] border border-slate-100 hover:border-[#F94C66]/30 rounded-xl px-3 py-2.5 transition-all group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F94C66] to-[#ff8fa0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {currentUser?.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser?.role}</p>
              </div>
              <ChevronDown size={13} className={`text-slate-400 transition-transform flex-shrink-0 ${showUserSwitcher ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown panel */}
            {showUserSwitcher && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/80 overflow-hidden z-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3 pt-3 pb-1">Select User</p>
                {userData?.users?.map((u: any) => {
                  const isActive = u.id === userId;
                  return (
                    <button
                      key={u.id}
                      onClick={() => { onChangeUser(u.id); setShowUserSwitcher(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                        isActive ? "bg-[#fff0f2]" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        isActive ? "bg-gradient-to-br from-[#F94C66] to-[#ff8fa0]" : "bg-gradient-to-br from-slate-300 to-slate-400"
                      }`}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.country || "Global"}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0 ${
                        u.role === "ADMIN" ? "bg-red-100 text-red-500" :
                        u.role === "MANAGER" ? "bg-blue-100 text-blue-500" :
                        "bg-green-100 text-green-500"
                      }`}>{u.role}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="mt-3 flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs font-medium px-2 py-2 rounded-xl hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={14} />
            Log out
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto flex flex-col" onClick={() => showUserSwitcher && setShowUserSwitcher(false)}>
          <div className="p-8 flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-400 text-base font-medium">Welcome To</p>
                <h1 className="text-4xl font-extrabold text-slate-800 leading-tight">Food Wisher</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                  <Bell size={16} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* ── My Cart Panel ── */}
            {activeNav === "cart" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">My Cart</h2>
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                    <ShoppingCart size={56} className="mb-4" />
                    <p className="text-lg font-semibold">Your cart is empty</p>
                    <p className="text-sm mt-1">Go to Discover to add items</p>
                    <button onClick={() => setActiveNav("discover")} className="mt-4 bg-[#F94C66] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#e03657] transition-colors">
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cart.map((c) => (
                      <div key={c.uiId} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <Image src={getFoodImage(c.name)} alt={c.name} width={56} height={56} className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{c.name}</p>
                          <p className="text-[#F94C66] font-bold text-lg">${c.price.toFixed(2)}</p>
                        </div>
                        <button onClick={() => onRemoveFromCart(c.uiId)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {cart.length > 0 && (
                  <div className="mt-8 flex items-center justify-between bg-slate-50 rounded-2xl p-5">
                    <div>
                      <p className="text-slate-500 text-sm">Total Amount</p>
                      <p className="text-3xl font-extrabold text-slate-800">${cart.reduce((s, c) => s + c.price, 0).toFixed(2)}</p>
                    </div>
                    {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") ? (
                      <button onClick={onCheckout} className="bg-[#F94C66] hover:bg-[#e03657] text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-lg shadow-red-200 transition-colors">
                        Check Out
                      </button>
                    ) : (
                      <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-3 text-center">
                        <p className="text-red-400 font-semibold text-sm">Access Restricted</p>
                        <p className="text-red-300 text-xs mt-0.5">Members cannot checkout</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Orders Panel ── */}
            {activeNav === "orders" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Order History</h2>
                {!ordersData?.orders?.length ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                    <FileText size={56} className="mb-4" />
                    <p className="text-lg font-semibold">No orders yet</p>
                    <p className="text-sm mt-1">Place your first order from the menu</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {ordersData.orders.map((o: any) => {
                      const isCompleted = o.status === "COMPLETED";
                      const isCancelled = o.status === "CANCELLED";
                      return (
                        <div key={o.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-700 text-sm">#{o.id.substring(0,8).toUpperCase()}</span>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                              isCompleted ? "bg-green-100 text-green-600" : isCancelled ? "bg-red-100 text-red-400" : "bg-yellow-100 text-yellow-600"
                            }`}>{o.status}</span>
                          </div>
                          <div className="space-y-1 mb-4">
                            {o.orderItems?.map((oi: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs text-slate-500">
                                <span>{oi.menuItem?.name}</span>
                                <span className="font-semibold">{oi.quantity}x</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="font-extrabold text-slate-800 text-lg">${o.totalAmount.toFixed(2)}</span>
                            {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") && !isCancelled && (
                              <button onClick={() => onCancelOrder(o.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Settings Panel ── */}
            {activeNav === "settings" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                  {[
                    { label: "Name", value: currentUser?.name || "—" },
                    { label: "Role", value: currentUser?.role || "—" },
                    { label: "Region", value: currentUser?.country || "Global" },
                    { label: "Access Level", value: currentUser?.role === "ADMIN" ? "Full Access" : currentUser?.role === "MANAGER" ? "Order & Cancel" : "View Only" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">{s.label}</p>
                      <p className="text-slate-800 font-bold text-base">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-[#fff8f9] border border-red-100 rounded-2xl p-5 max-w-2xl">
                  <p className="text-sm font-bold text-slate-700 mb-1">Role Permissions</p>
                  <div className="space-y-2 mt-3">
                    {[
                      { role: "ADMIN", perms: "View restaurants, place orders, cancel any order", color: "text-red-500", bg: "bg-red-100" },
                      { role: "MANAGER", perms: "View restaurants, place orders, cancel orders in their region", color: "text-blue-500", bg: "bg-blue-100" },
                      { role: "MEMBER", perms: "View restaurants only — cannot checkout or cancel", color: "text-green-500", bg: "bg-green-100" },
                    ].map((r) => (
                      <div key={r.role} className={`flex items-start gap-3 p-3 rounded-xl ${currentUser?.role === r.role ? "bg-white border border-slate-100 shadow-sm" : ""}`}>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${r.bg} ${r.color} flex-shrink-0 mt-0.5`}>{r.role}</span>
                        <p className="text-xs text-slate-500">{r.perms}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications Panel ── */}
            {activeNav === "notifs" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Notifications</h2>
                {!ordersData?.orders?.length ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                    <Bell size={56} className="mb-4" />
                    <p className="text-lg font-semibold">No notifications</p>
                    <p className="text-sm mt-1">Order activity will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-2xl">
                    {ordersData.orders.map((o: any) => {
                      const isCompleted = o.status === "COMPLETED";
                      const isCancelled = o.status === "CANCELLED";
                      return (
                        <div key={o.id} className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted ? "bg-green-100" : isCancelled ? "bg-red-100" : "bg-yellow-100"
                          }`}>
                            {isCompleted ? <CheckCircle size={18} className="text-green-500" /> :
                             isCancelled ? <XCircle size={18} className="text-red-400" /> :
                             <Clock size={18} className="text-yellow-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">
                              Order #{o.id.substring(0,8).toUpperCase()} — {o.status}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{o.orderItems?.length} item{o.orderItems?.length !== 1 ? "s" : ""} · ${o.totalAmount.toFixed(2)}</p>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                            isCompleted ? "bg-green-100 text-green-600" : isCancelled ? "bg-red-100 text-red-400" : "bg-yellow-100 text-yellow-600"
                          }`}>{o.status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Inbox Panel ── */}
            {activeNav === "inbox" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Inbox</h2>
                <div className="space-y-3 max-w-2xl">
                  {[
                    { from: "Food Wisher Team", msg: "Welcome! You can browse restaurants and place orders.", time: "Just now", avatar: "🍔" },
                    { from: "Support", msg: "Need help? Contact us anytime for assistance with your orders.", time: "2h ago", avatar: "💬" },
                    { from: "Promotions", msg: "50% off on any food! Valid until Feb 29. Don't miss out!", time: "1d ago", avatar: "🎉" },
                  ].map((msg, i) => (
                    <div key={i} className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">{msg.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-bold text-slate-700">{msg.from}</p>
                          <p className="text-[10px] text-slate-400">{msg.time}</p>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{msg.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Discover Panel (default) ── */}
            {activeNav === "discover" && (
              <div>
                {/* Promo Banner */}
                <div className="relative bg-[#FFFBE8] rounded-3xl overflow-hidden mb-7 h-44">
                  <div className="absolute inset-0 flex items-center px-10">
                    <div>
                      <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">
                        50% off<br />on any food
                      </h2>
                      <p className="text-slate-400 text-base mt-2">Valid until Feb 29</p>
                    </div>
                  </div>
                  <div className="absolute right-6 top-0 bottom-0 flex items-center gap-2 opacity-85">
                    <span className="text-6xl -rotate-12 drop-shadow-sm">🍔</span>
                    <span className="text-5xl rotate-6 drop-shadow-sm">🍩</span>
                    <span className="text-5xl -rotate-6 drop-shadow-sm">🍕</span>
                    <span className="text-4xl rotate-12 drop-shadow-sm">🧋</span>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex gap-3 mb-7 overflow-x-auto pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex-shrink-0 px-6 py-3 rounded-full text-base font-semibold transition-all ${
                        activeCategory === cat
                          ? "bg-[#F94C66] text-white shadow-md shadow-red-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Menu Items Grid */}
                {restData?.restaurants?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <span className="text-5xl mb-3">🌍</span>
                    <p className="font-semibold">No restaurants available in your region.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredItems.map((item, i) => (
                      <MenuItemCard
                        key={`${item.id}-${i}`}
                        item={item}
                        colorClass={CARD_COLORS[i % CARD_COLORS.length]}
                        onAdd={() => onAddToCart(item)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>


        {/* ── Right Panel: My Order ── */}
        <aside className="w-80 flex-shrink-0 flex flex-col border-l border-slate-100 bg-white">
          <div className="p-7 flex flex-col h-full">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6">My order</h2>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
              {cartDisplay.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 py-8">
                  <ShoppingCart size={36} className="mb-3" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <p className="text-xs mt-1">Add items from the menu</p>
                </div>
              ) : (
                cartDisplay.map(({ item, qty }) => (
                  <CartItemRow
                    key={item.uiId}
                    item={item}
                    qty={qty}
                    onRemove={() => onRemoveFromCart(item.uiId)}
                  />
                ))
              )}
            </div>

            {/* Checkout Section */}
            {cart.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 text-base">Subtotal</span>
                  <span className="text-slate-800 font-bold text-xl">${total.toFixed(2)}</span>
                </div>

                {canCheckout ? (
                  <button
                    id="checkout-btn"
                    onClick={onCheckout}
                    className="w-full bg-[#F94C66] hover:bg-[#e03657] active:scale-[0.98] text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-red-200 text-lg"
                  >
                    Check Out
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                    <p className="text-red-400 font-semibold text-sm">Access Restricted</p>
                    <p className="text-red-300 text-xs mt-1">Members cannot checkout</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Orders strip */}
            {ordersData?.orders?.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Recent Orders</p>
                  <button
                    onClick={() => setShowOrderHistory(!showOrderHistory)}
                    className="text-[10px] text-[#F94C66] font-semibold"
                  >
                    {showOrderHistory ? "Hide" : "See all"}
                  </button>
                </div>
                <div className="flex flex-col">
                  {ordersData.orders.slice(0, 3).map((o: any) => (
                    <OrderHistoryItem
                      key={o.id}
                      order={o}
                      canCancel={canCheckout && o.status !== "CANCELLED"}
                      onCancel={() => onCancelOrder(o.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Root Page Component ───────────────────────────────────────────────────────

export default function Home() {
  const { userId, setUserId } = useContext(UserContext);

  const [userData, setUserData] = useState<any>(null);
  const [restData, setRestData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; uiId: number }[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedLoginUser, setSelectedLoginUser] = useState("");

  // Fetch all user list on mount (needed for Login dropdown)
  useEffect(() => {
    const client = getApolloClient("system");
    client.query({ query: GET_USERS }).then((result) => {
      const data = result.data as any;
      setUserData(data);
      if (!selectedLoginUser && data?.users?.length > 0) {
        setSelectedLoginUser(data.users[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch restaurants & orders whenever userId changes (after login)
  useEffect(() => {
    if (!loggedIn || !userId) return;
    const client = getApolloClient(userId);
    client.query({ query: GET_RESTAURANTS, fetchPolicy: "network-only" }).then(({ data }) => setRestData(data));
    client.query({ query: GET_ORDERS, fetchPolicy: "network-only" }).then(({ data }) => setOrdersData(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, userId]);

  const handleEnterDashboard = () => {
    setUserId(selectedLoginUser);
    setLoggedIn(true);
  };

  const handleChangeUser = (id: string) => {
    setUserId(id);
    setCart([]);
    // Refetch
    const client = getApolloClient(id);
    client.query({ query: GET_RESTAURANTS, fetchPolicy: "network-only" }).then(({ data }) => setRestData(data));
    client.query({ query: GET_ORDERS, fetchPolicy: "network-only" }).then(({ data }) => setOrdersData(data));
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCart([]);
    setRestData(null);
    setOrdersData(null);
  };

  const addToCart = (item: any) => {
    setCart((prev) => [...prev, { ...item, uiId: Math.random() }]);
  };

  const removeFromCart = (uiId: number) => {
    setCart((prev) => prev.filter((c) => c.uiId !== uiId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const client = getApolloClient(userId);
      await client.mutate({
        mutation: PLACE_ORDER,
        variables: { menuItemIds: cart.map((c) => c.id) },
      });
      setCart([]);
      const { data } = await client.query({ query: GET_ORDERS, fetchPolicy: "network-only" });
      setOrdersData(data);
      alert("Order placed successfully! 🎉");
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const client = getApolloClient(userId);
      await client.mutate({ mutation: CANCEL_ORDER, variables: { orderId } });
      const { data } = await client.query({ query: GET_ORDERS, fetchPolicy: "network-only" });
      setOrdersData(data);
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  const currentUser = userData?.users?.find((u: any) => u.id === userId);

  // Show login if not logged in
  if (!loggedIn) {
    return (
      <LoginScreen
        users={userData?.users || []}
        selectedId={selectedLoginUser}
        onSelect={setSelectedLoginUser}
        onEnter={handleEnterDashboard}
      />
    );
  }

  return (
    <Dashboard
      userData={userData}
      restData={restData}
      ordersData={ordersData}
      cart={cart}
      userId={userId}
      currentUser={currentUser}
      onAddToCart={addToCart}
      onRemoveFromCart={removeFromCart}
      onCheckout={handleCheckout}
      onCancelOrder={handleCancelOrder}
      onChangeUser={handleChangeUser}
      onLogout={handleLogout}
    />
  );
}
