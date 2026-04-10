"use client";

import { gql } from "@apollo/client";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "./context";
import { getApolloClient } from "./apolloClient";

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

export default function Home() {
  const { userId, setUserId } = useContext(UserContext);
  
  const [userData, setUserData] = useState<any>(null);
  const [restData, setRestData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);

  const fetchUsers = async () => {
    const client = getApolloClient(userId);
    const { data } = await client.query({ query: GET_USERS });
    setUserData(data);
  };

  const fetchRests = async () => {
    const client = getApolloClient(userId);
    const { data } = await client.query({ query: GET_RESTAURANTS, fetchPolicy: 'network-only' });
    setRestData(data);
  };

  const fetchOrders = async () => {
    const client = getApolloClient(userId);
    const { data } = await client.query({ query: GET_ORDERS, fetchPolicy: 'network-only' });
    setOrdersData(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchRests();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const [cart, setCart] = useState<{id: string, name: string, price: number, uiId: number}[]>([]);

  const addToCart = (item: any) => {
    setCart([...cart, { ...item, uiId: Math.random() }]);
  };

  const removeFromCart = (uiId: number) => {
    setCart(cart.filter(c => c.uiId !== uiId));
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const client = getApolloClient(userId);
      await client.mutate({ mutation: PLACE_ORDER, variables: { menuItemIds: cart.map(c => c.id) } });
      setCart([]);
      fetchOrders();
      alert("Order placed successfully!");
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const client = getApolloClient(userId);
      await client.mutate({ mutation: CANCEL_ORDER, variables: { orderId: id } });
      fetchOrders();
      alert("Order cancelled");
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  }

  const changeUser = (u: string) => {
    setUserId(u);
    setCart([]);
  };

  const currentUser = userData?.users?.find((u: any) => u.id === userId);

  return (
    <main className="max-w-7xl mx-auto p-6 text-slate-800">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-slate-300 pb-4">
        <h1 className="text-3xl font-semibold text-[#2665fd] mb-4 sm:mb-0">Food Orders</h1>
        <div className="flex gap-4 items-center bg-slate-100 px-4 py-2 rounded-lg">
          <span className="text-sm font-semibold text-slate-600">Simulate Access:</span>
          <select 
            className="p-2 border rounded-md border-slate-300 shadow-sm bg-white text-slate-800 outline-none focus:border-[#2665fd]"
            value={userId} 
            onChange={(e) => changeUser(e.target.value)}
          >
            {userData?.users?.map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.role} {u.country ? `(${u.country})` : ''}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-medium mb-4 text-[#1e293b]">Restaurants Dashboard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restData?.restaurants?.map((r: any) => (
              <div key={r.id} className="bg-white p-6 rounded-[8px] shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold mb-2 text-[#2665fd]">{r.name}</h3>
                <span className="bg-[#6074b9]/10 text-[#6074b9] px-3 py-1 rounded-full text-xs font-medium uppercase mb-4 inline-block">{r.country}</span>
                <ul className="space-y-3 mt-2 border-t border-slate-100 pt-4">
                  {r.menuItems.map((m: any) => (
                    <li key={m.id} className="flex justify-between items-center group bg-slate-50 p-2 rounded w-full">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 text-sm">{m.name}</span>
                        <span className="text-sm text-slate-500 font-medium">${m.price.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => addToCart(m)}
                        className="bg-[#2665fd] text-white px-3 py-1.5 rounded-[8px] text-xs font-medium hover:bg-[#1f52cd] transition-colors"
                      >
                        + Add
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {restData?.restaurants?.length === 0 && (
              <div className="p-8 text-center text-slate-500 col-span-2">No restaurants available in this region.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-white p-6 rounded-[8px] shadow-sm border border-slate-200">
            <h2 className="text-xl font-medium mb-4 text-[#1e293b]">Cart</h2>
            {cart.length === 0 ? <p className="text-[#757681] text-sm text-center py-4">Your cart is empty.</p> : (
              <>
                <ul className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                  {cart.map((c, i) => (
                    <li key={c.uiId} className="flex justify-between items-center text-sm py-2 border-b last:border-0 border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <span className="text-slate-500">${c.price.toFixed(2)}</span>
                      </div>
                      <button onClick={() => removeFromCart(c.uiId)} className="text-[#bd3800] text-xs font-semibold px-2 py-1 bg-red-50 hover:bg-red-100 rounded">Remove</button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-slate-200 mt-4 pt-4 flex flex-col gap-4">
                  <div className="flex justify-between font-semibold text-lg text-slate-900">
                    <span>Total:</span>
                    <span>${cart.reduce((s, c) => s + c.price, 0).toFixed(2)}</span>
                  </div>
                  {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') ? (
                    <button onClick={handleCheckout} className="w-full bg-[#2665fd] hover:bg-[#1f52cd] text-white font-medium py-2.5 rounded-[8px] transition-colors shadow-sm">
                      Checkout Cart
                    </button>
                  ) : (
                    <div className="text-sm text-[#bd3800] bg-orange-50 p-3 rounded-lg border border-orange-100 shadow-sm">
                      <span className="font-semibold block mb-1">Action Restricted</span>
                      Members are not permitted to checkout.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-6 rounded-[8px] shadow-sm border border-slate-200">
            <h2 className="text-xl font-medium mb-4 text-[#1e293b]">My Orders</h2>
            {ordersData?.orders?.length === 0 ? <p className="text-[#757681] text-sm text-center py-4">No recent orders.</p> : (
              <ul className="space-y-4">
                {ordersData?.orders?.map((o: any) => (
                  <li key={o.id} className="border border-slate-100 p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between mb-2 items-center">
                      <span className="font-medium text-[#6074b9] text-sm">#{o.id.substring(0,8).toUpperCase()}</span>
                      <span className="font-semibold text-slate-900">${o.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 border-t border-slate-100 pt-3">
                       <span className={`text-[11px] px-2 py-1 font-semibold rounded uppercase tracking-wider ${o.status === 'COMPLETED' ? 'bg-[#2665fd]/10 text-[#2665fd]' : 'bg-[#bd3800]/10 text-[#bd3800]'}`}>
                         {o.status}
                       </span>
                       {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && o.status !== 'CANCELLED' && (
                         <button onClick={() => handleCancel(o.id)} className="text-[#bd3800] text-xs font-medium hover:bg-orange-50 px-2 py-1 rounded transition-colors border border-transparent hover:border-orange-100">
                           Cancel Order
                         </button>
                       )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
