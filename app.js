const API = "https://prototipo-pos-backend.onrender.com";

function show(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

async function loadProducts() {
  const res = await fetch(`${API}/api/products`);
  const data = await res.json();

  const table = document.getElementById("productTable");
  const select = document.getElementById("productSelect");

  table.innerHTML = "";
  select.innerHTML = "";

  data.forEach(p => {
    table.innerHTML += `<tr><td>${p.name}</td><td>${p.price}</td><td>${p.stock}</td></tr>`;
    select.innerHTML += `<option value="${p.price}">${p.name}</option>`;
  });

  document.getElementById("totalProducts").innerText = data.length;
}

async function addProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const stock = document.getElementById("stock").value;

  await fetch(`${API}/api/products`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ name, price, stock })
  });

  loadProducts();
}

async function sell() {
  const price = document.getElementById("productSelect").value;
  const qty = document.getElementById("qty").value;

  const total = price * qty;

  await fetch(`${API}/api/sales`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ total })
  });

  document.getElementById("saleTotal").innerText = total;

  loadReports();
}

async function loadReports() {
  const res = await fetch(`${API}/api/sales`);
  const data = await res.json();

  const list = document.getElementById("salesList");
  list.innerHTML = "";

  let total = 0;

  data.forEach(s => {
    total += s.total;
    list.innerHTML += `<li>Venta: $${s.total}</li>`;
  });

  document.getElementById("totalSales").innerText = total;
}

loadProducts();
loadReports();
