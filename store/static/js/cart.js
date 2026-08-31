(function () {
  "use strict";

  var STORAGE_KEY = "fitstore_cart_v1";

  function getCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* localStorage indisponível (ex: navegação privada) */
    }
  }

  function formatPrice(cents) {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function updateCartBadge() {
    var badge = document.getElementById("cart-count");
    if (!badge) return;
    var cart = getCart();
    var total = cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
    badge.textContent = total;
    badge.hidden = total === 0;
  }

  function addToCart(item) {
    var cart = getCart();
    var existing = cart.find(function (i) {
      return i.id === item.id && i.size === item.size;
    });
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push(item);
    }
    saveCart(cart);
    updateCartBadge();
  }

  function removeFromCart(index) {
    var cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
    updateCartBadge();
  }

  function updateQty(index, rawQty) {
    var cart = getCart();
    if (!cart[index]) return;
    var qty = parseInt(rawQty, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    cart[index].qty = qty;
    saveCart(cart);
    renderCartPage();
    updateCartBadge();
  }

  function buildWhatsAppLink(cart, total) {
    var number = (window.STORE_CONFIG && window.STORE_CONFIG.whatsappNumber) || "";
    var lines = ["Olá! Vim pelo site e gostaria de fazer o seguinte pedido:", ""];
    cart.forEach(function (item) {
      var sizeText = item.size ? " (Tam. " + item.size + ")" : "";
      lines.push("• " + item.qty + "x " + item.name + sizeText + " — " + formatPrice(item.price));
    });
    lines.push("");
    lines.push("Total: " + formatPrice(total));
    var text = encodeURIComponent(lines.join("\n"));
    return "https://wa.me/" + number + "?text=" + text;
  }

  function renderCartPage() {
    var container = document.getElementById("cart-items");
    if (!container) return;

    var cart = getCart();
    var emptyEl = document.getElementById("cart-empty");
    var summaryEl = document.getElementById("cart-summary");

    if (cart.length === 0) {
      container.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      if (summaryEl) summaryEl.hidden = true;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    if (summaryEl) summaryEl.hidden = false;

    var total = 0;
    container.innerHTML = cart
      .map(function (item, index) {
        total += item.price * item.qty;
        var safeName = escapeHtml(item.name);
        var imageTag = item.image
          ? '<img src="' + escapeHtml(item.image) + '" alt="' + safeName + '">'
          : '<div class="product-image-placeholder small">' + escapeHtml(item.name.slice(0, 2).toUpperCase()) + "</div>";

        return (
          '<div class="cart-item">' +
          imageTag +
          '<div class="cart-item-info">' +
          '<p class="cart-item-name">' + safeName + "</p>" +
          (item.size ? '<p class="cart-item-size">Tamanho: ' + escapeHtml(item.size) + "</p>" : "") +
          '<p class="cart-item-price">' + formatPrice(item.price) + "</p>" +
          '<div class="cart-item-qty">' +
          '<label>Qtd: <input type="number" min="1" value="' + item.qty + '" data-index="' + index + '" class="qty-input"></label>' +
          '<button type="button" class="remove-item" data-index="' + index + '">Remover</button>' +
          "</div></div></div>"
        );
      })
      .join("");

    var totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.textContent = formatPrice(total);

    container.querySelectorAll(".qty-input").forEach(function (input) {
      input.addEventListener("change", function (e) {
        updateQty(parseInt(e.target.getAttribute("data-index"), 10), e.target.value);
      });
    });
    container.querySelectorAll(".remove-item").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        removeFromCart(parseInt(e.target.getAttribute("data-index"), 10));
      });
    });

    var checkoutLink = document.getElementById("checkout-whatsapp");
    if (checkoutLink) {
      checkoutLink.href = buildWhatsAppLink(cart, total);
    }
  }

  function initAddToCartForm() {
    var form = document.getElementById("add-to-cart-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var sizeSelect = form.querySelector("#size");
      if (sizeSelect && !sizeSelect.value) {
        sizeSelect.reportValidity();
        return;
      }

      var qtyInput = form.querySelector("#qty");
      var qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);

      addToCart({
        id: form.getAttribute("data-product-id"),
        name: form.getAttribute("data-product-name"),
        price: parseInt(form.getAttribute("data-product-price"), 10),
        image: form.getAttribute("data-product-image"),
        size: sizeSelect ? sizeSelect.value : null,
        qty: qty,
      });

      var feedback = document.getElementById("add-to-cart-feedback");
      if (feedback) feedback.hidden = false;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateCartBadge();
    renderCartPage();
    initAddToCartForm();
  });
})();
