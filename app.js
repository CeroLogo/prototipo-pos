const API = "https://prototipo-pos-backend.onrender.com";

async function loadProducts() {
  const res = await fetch(`${API}/api/products`);
  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} - $${p.price}`;
    list.appendChild(li);
  });
}

async function addProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const stock = document.getElementById("stock").value;

  await fetch(`${API}/api/products`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, price, stock })
  });

  loadProducts();
}

async function addSale() {
  const total = document.getElementById("total").value;

  await fetch(`${API}/api/sales`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ total })
  });

  alert("Venta registrada");
}

loadProducts();
