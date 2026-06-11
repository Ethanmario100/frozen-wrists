window.cart = JSON.parse(localStorage.getItem('fw_cart') || '[]');

function saveCart() { localStorage.setItem('fw_cart', JSON.stringify(cart)); updateCartUI(); }

window.addToCart = function(id, name, price, img) {
  var it = cart.find(function(i) { return i.id === id; });
  if (it) it.qty++;
  else cart.push({id: id, name: name, price: parseFloat(price), img: img, qty: 1});
  saveCart();
  showToast(name + ' added to cart');
};

function removeFromCart(id) { cart = cart.filter(function(i) { return i.id !== id; }); saveCart(); }
function cartTotal() { return cart.reduce(function(t, i) { return t + i.price * i.qty; }, 0).toFixed(2); }
function cartCount() { return cart.reduce(function(t, i) { return t + i.qty; }, 0); }

function updateCartUI() {
  var el = document.getElementById('cartCount');
  if (el) el.textContent = cartCount();
}

function showToast(msg) {
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0071e3;color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:99999;animation:fadeInUp 0.3s ease,fadeOut 0.3s ease 1.7s forwards';
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 2200);
}

window.openCart = function() {
  if (cart.length === 0) { showToast('Cart is empty'); return; }
  
  var h = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99998;display:flex;align-items:center;justify-content:center" onmousedown="if(event.target===this)this.remove()">';
  h += '<div style="background:#1c1c1e;border-radius:20px;padding:24px;max-width:480px;width:90vw;max-height:80vh;overflow-y:auto">';
  h += '<h3 style="color:#f5f5f7;margin-bottom:16px">Cart (' + cartCount() + ' items)</h3>';
  
  cart.forEach(function(item, i) {
    h += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #2a2a2c">';
    if (item.img) h += '<img src="' + item.img + '" style="width:48px;height:48px;border-radius:8px;object-fit:cover;background:#2c2c2e">';
    h += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#f5f5f7">' + item.name + '</div><div style="font-size:12px;color:#6e6e73">$' + item.price.toFixed(2) + ' x ' + item.qty + '</div></div>';
    h += '<button data-rm="' + i + '" class="cr-btn" style="background:none;border:none;color:#ff453a;cursor:pointer;font-size:18px">' + '\u00d7' + '</button>';
    h += '</div>';
  });
  
  h += '<div style="display:flex;justify-content:space-between;padding:16px 0;font-size:16px;font-weight:700;color:#f5f5f7"><span>Total</span><span>$' + cartTotal() + '</span></div>';
  h += '<button id="cartCheckoutBtn" style="width:100%;background:#0071e3;color:#fff;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer">Checkout</button>';
  h += '</div></div>';
  
  var m = document.createElement('div');
  m.innerHTML = h;
  m.addEventListener('click', function(e) {
    var b = e.target.closest('.cr-btn');
    if (b) {
      removeFromCart(cart[parseInt(b.dataset.rm)].id);
      saveCart();
      m.remove();
      openCart();
    }
    if (e.target.id === 'cartCheckoutBtn') checkout();
  });
  document.body.appendChild(m);
};

window.checkout = async function() {
  if (cart.length === 0) return;
  var li = cart.map(function(it) {
    return {
      price_data: {
        currency: 'usd',
        product_data: { name: it.name, images: it.img ? [location.origin + it.img] : [] },
        unit_amount: Math.round(it.price * 100),
      },
      quantity: it.qty,
    };
  });
  try {
    var r = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line_items: li })
    });
    var d = await r.json();
    if (d.url) location.href = d.url;
    else { showToast('Demo mode'); cart = []; saveCart(); }
  } catch (e) {
    showToast('Server error - is server.py running?');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  updateCartUI();
  var s = document.createElement('style');
  s.textContent = '@keyframes fadeInUp{0%{opacity:0;transform:translateX(-50%) translateY(12px)}100%{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes fadeOut{0%{opacity:1}100%{opacity:0}}';
  document.head.appendChild(s);
});
