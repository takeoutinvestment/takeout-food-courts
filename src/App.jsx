import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [diningOption, setDiningOption] = useState('');

  // Admin Form States
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [foodCategory, setFoodCategory] = useState('Burgers');
  const [imageUrl, setImageUrl] = useState(''); // Text Input for easy image links
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (!error) setMenuItems(data);
  }

  const addToCart = (item) => {
    const exist = cart.find((x) => x.id === item.id);
    if (exist) {
      setCart(cart.map((x) => x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      alert("Aapka cart khaali hai!");
      return;
    }
    setShowOrderModal(true);
  };

  const placeFinalOrder = () => {
    alert(`🎉 Order Successful!\nOption: ${diningOption}\nTotal: Rs. ${totalAmount}`);
    setCart([]);
    setShowOrderModal(false);
    setDiningOption('');
  };

  // Admin: Insert Food Item (No Storage Dependency)
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Default fallback images matching Pakistani foods if input is empty
    const defaultImage = imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500';

    try {
      const { error: dbError } = await supabase
        .from('menu_items')
        .insert([{ 
          title: title, 
          price: parseFloat(price), 
          category: foodCategory, 
          image_url: defaultImage 
        }]);

      if (dbError) throw dbError;

      alert('Food Item Added Successfully! 🍔');
      setTitle(''); setPrice(''); setImageUrl('');
      fetchMenu();
    } catch (err) {
      alert(`Database Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    return (category === 'All' || item.category === category) &&
           item.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative">
      <header className="bg-orange-500 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight">Take⭕ut Food Courts</h1>
          <div className="bg-white text-orange-600 px-4 py-1.5 rounded-full font-bold shadow-sm">
            🛒 Cart ({cart.reduce((a, c) => a + c.qty, 0)})
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
            <input 
              type="text" 
              placeholder="🔍 Search delicious food in PKR..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none"
            />
            <div className="flex gap-2 overflow-x-auto">
              {['All', 'Burgers', 'Pizzas', 'Drinks', 'Deals'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                    category === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col justify-between">
                <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-xs text-gray-400 bg-gray-100 inline-block px-2 py-0.5 rounded">{item.category}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-black text-gray-900">Rs. {item.price}</span>
                    <button onClick={() => addToCart(item)} className="bg-orange-500 text-white font-bold px-4 py-1.5 rounded-lg text-sm">
                      + Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 space-y-4">
            <h2 className="text-xl font-extrabold text-gray-800 border-b pb-2">Order Summary</h2>
            {cart.length === 0 ? (
              <p className="text-sm text-gray-400">Cart khaali hai.</p>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.title} x{item.qty}</span>
                    <span className="font-semibold">Rs. {item.price * item.qty}</span>
                  </div>
                ))}
                <div className="border-t pt-3 mt-2 flex justify-between font-black text-lg text-orange-600">
                  <span>Total Bill:</span>
                  <span>Rs. {totalAmount}</span>
                </div>
                <button onClick={handleCheckoutClick} className="w-full mt-4 bg-green-500 text-white font-bold py-2.5 rounded-xl">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-xl font-extrabold text-gray-800 border-b pb-2">Admin Control (PKR)</h2>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500">Food Name</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded mt-1 text-sm" placeholder="e.g. Zinger Burger" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500">Price (Rs.)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full p-2 border rounded mt-1 text-sm" placeholder="e.g. 350" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500">Category</label>
                <select value={foodCategory} onChange={e => setFoodCategory(e.target.value)} className="w-full p-2 border rounded mt-1 text-sm">
                  <option value="Burgers">Burgers</option>
                  <option value="Pizzas">Pizzas</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Deals">Deals</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500">Image Link (Optional)</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 border rounded mt-1 text-sm" placeholder="Leave empty for default picture" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-bold py-2 rounded text-sm">
                {loading ? 'Adding...' : 'Publish Food Item'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-900">How would you like your food?</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setDiningOption('Dine In')} className={`p-4 border-2 rounded-xl text-center font-bold ${diningOption === 'Dine In' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200'}`}>
                🍽️ Dine In
              </button>
              <button type="button" onClick={() => setDiningOption('Take Away')} className={`p-4 border-2 rounded-xl text-center font-bold ${diningOption === 'Take Away' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200'}`}>
                🛍️ Take Away
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowOrderModal(false); setDiningOption(''); }} className="flex-1 bg-gray-100 py-2.5 rounded-xl font-bold">Cancel</button>
              <button onClick={placeFinalOrder} disabled={!diningOption} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-bold">Place Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}