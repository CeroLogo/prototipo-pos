const API = "https://prototipo-pos-backend.onrender.com";

function showSection(id, btn) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function money(value) {
  return new Intl.NumberFormat("es-CO").format(Number(value || 0));
}

async function loadProducts() {
  const res = await fetch(`${API}/api/products`);
  const products = await res.json();

  const table = document.getElementById("productTable");
  const select = document.getElementById("productSelect");
  const lowStockAlert = document.getElementById("lowStockAlert");

  table.innerHTML = "";
  select.innerHTML = "";

  if (products.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted py-4">
          No hay productos registrados
        </td>
      </tr>`;
    select.innerHTML = `<option value="">No hay productos</option>`;
  } else {
    products.forEach(p => {
      table.innerHTML += `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>$${money(p.price)}</td>
          <td>
            <span class="badge ${p.stock <= 5 ? 'text-bg-warning' : 'text-bg-success'}">
              ${p.stock}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger me-1" onclick="deleteProduct(${p.id})">Eliminar</button>
          </td>
        </tr>`;

      select.innerHTML += `<option value="${p.id}">${p.name} - $${money(p.price)} (Stock: ${p.stock})</option>`;
    });
  }

  const lowStock = products.filter(p => p.stock <= 5);
  if (lowStock.length > 0) {
    lowStockAlert.classList.remove("d-none");
    lowStockAlert.innerHTML = `<strong>Alerta:</strong> ${lowStock.length} producto(s) con stock bajo: ${lowStock.map(p => p.name).join(", ")}`;
  } else {
    lowStockAlert.classList.add("d-none");
  }

  document.getElementById("totalProducts").innerText = products.length;
  updateSummary();
}

async function addProduct() {
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value;
  const stock = document.getElementById("stock").value;

  if (!name || !price || !stock) {
    alert("Completa todos los campos del producto.");
    return;
  }

  const res = await fetch(`${API}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, stock })
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "No se pudo agregar el producto");
    return;
  }

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("stock").value = "";

  await loadProducts();
}

async function deleteProduct(id) {
  if (!confirm("¿Eliminar este producto?")) return;

  await fetch(`${API}/api/products/${id}`, {
    method: "DELETE"
  });

  await loadProducts();
  await loadSales();
}

function previewTotal() {
  const productId = Number(document.getElementById("productSelect").value);
  const qty = Number(document.getElementById("qty").value);

  fetch(`${API}/api/products`)
    .then(res => res.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (!product || !qty) {
        document.getElementById("saleTotal").innerText = "0";
        return;
      }
      document.getElementById("saleTotal").innerText = money(product.price * qty);
    });
}

async function sell() {
  const productId = Number(document.getElementById("productSelect").value);
  const qty = Number(document.getElementById("qty").value);

  if (!productId || !qty || qty <= 0) {
    alert("Selecciona un producto y escribe una cantidad válida.");
    return;
  }

  const res = await fetch(`${API}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, qty })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "No se pudo registrar la venta");
    return;
  }

  document.getElementById("qty").value = "";
  document.getElementById("saleTotal").innerText = money(data.subtotal);

  await loadProducts();
  await loadSales();
}

async function loadSales() {
  const res = await fetch(`${API}/api/sales`);
  const sales = await res.json();

  const table = document.getElementById("salesTable");
  table.innerHTML = "";

  if (sales.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          No hay ventas registradas
        </td>
      </tr>`;
    return;
  }

  sales.forEach(s => {
    table.innerHTML += `
      <tr>
        <td>${s.id}</td>
        <td><strong>${s.productName}</strong></td>
        <td>${s.qty}</td>
        <td>$${money(s.unitPrice)}</td>
        <td>$${money(s.subtotal)}</td>
        <td>${s.date}</td>
      </tr>`;
  });
}

async function updateSummary() {
  const res = await fetch(`${API}/api/summary`);
  const data = await res.json();

  document.getElementById("totalSales").innerText = `$${money(data.totalSales)}`;
  document.getElementById("totalSalesCount").innerText = data.totalSalesCount;
  document.getElementById("lowStock").innerText = data.lowStock;
}

loadProducts();
loadSales();
updateSummary();
