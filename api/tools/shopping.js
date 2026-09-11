// In-memory cart per session
const carts = new Map();

function getCart(sessionId = "default") {
  if (!carts.has(sessionId)) {
    carts.set(sessionId, []);
  }
  return carts.get(sessionId);
}

let cachedProducts = null;

async function fetchProducts() {
  if (cachedProducts) return cachedProducts;
  const res = await fetch("https://fakestoreapi.com/products");
  cachedProducts = await res.json();
  return cachedProducts;
}

function matchProduct(products, query) {
  const q = query.toLowerCase();
  return products.find(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

async function searchProducts({ query }) {
  const products = await fetchProducts();
  const q = query.toLowerCase();
  const matches = products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    return {
      success: true,
      data: { products: [], count: 0, query },
      spoken_summary: `No products found matching "${query}". Try a different search term.`,
    };
  }

  const top5 = matches.slice(0, 5).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    category: p.category,
  }));

  return {
    success: true,
    data: { products: top5, count: matches.length, query },
    spoken_summary: `Found ${matches.length} products matching "${query}". Here are the top results: ${top5.map((p) => `${p.title} for $${p.price}`).join(". ")}.`,
  };
}

async function manageCart({ action, product_query, quantity = 1, sessionId = "default" }) {
  const cart = getCart(sessionId);
  const products = await fetchProducts();

  switch (action) {
    case "view": {
      if (cart.length === 0) {
        return {
          success: true,
          data: { items: [], total: 0 },
          spoken_summary: "Your cart is empty.",
        };
      }
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return {
        success: true,
        data: { items: cart, total: Math.round(total * 100) / 100 },
        spoken_summary: `You have ${cart.length} item(s) in your cart totaling $${total.toFixed(2)}. Items: ${cart.map((i) => `${i.title} x${i.quantity}`).join(", ")}.`,
      };
    }

    case "add": {
      if (!product_query) {
        return {
          success: false,
          error: "product_query is required for add action",
          spoken_summary: "What product would you like to add to your cart?",
        };
      }
      const product = matchProduct(products, product_query);
      if (!product) {
        return {
          success: false,
          error: `No product matching "${product_query}"`,
          spoken_summary: `I couldn't find a product matching "${product_query}" in the catalog.`,
        };
      }
      const existing = cart.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity,
        });
      }
      return {
        success: true,
        data: { item: product.title, quantity, price: product.price },
        spoken_summary: `Added ${quantity}x "${product.title}" to your cart at $${product.price} each.`,
      };
    }

    case "remove": {
      if (!product_query) {
        return {
          success: false,
          error: "product_query is required for remove action",
          spoken_summary: "Which product would you like to remove from your cart?",
        };
      }
      const idx = cart.findIndex(
        (i) => i.title.toLowerCase().includes(product_query.toLowerCase())
      );
      if (idx === -1) {
        return {
          success: false,
          error: `No cart item matching "${product_query}"`,
          spoken_summary: `I couldn't find "${product_query}" in your cart.`,
        };
      }
      const removed = cart.splice(idx, 1)[0];
      return {
        success: true,
        data: { item: removed.title, removed_quantity: removed.quantity },
        spoken_summary: `Removed "${removed.title}" from your cart.`,
      };
    }

    case "clear": {
      cart.length = 0;
      return {
        success: true,
        data: { cleared: true },
        spoken_summary: "Your cart has been cleared.",
      };
    }

    default:
      return {
        success: false,
        error: `Unknown action: ${action}`,
        spoken_summary: `I don't know how to perform the action "${action}".`,
      };
  }
}

module.exports = { searchProducts, manageCart };
