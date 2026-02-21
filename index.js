// ============================
// CONFIG
// ============================
const WHATSAPP_PHONE = "5493810000000"; // <-- CAMBIÁ por tu número (con código país). Ej: 549381xxxxxxx
const MAPS_LINK = "https://www.google.com/maps"; // <-- Cambiá por link real de Google Maps del local

// ============================
// DATA (Productos demo)
// ============================
const PRODUCTS = [
  {
    id: "P001",
    name: "Balanceado Premium Adulto 15kg",
    category: "Alimentos",
    price: 0,
    tags: ["perro", "adulto", "premium"],
    img: "img/balanceado-adulto.png",
    desc: "Alimento completo para perro adulto. Ideal para energía y digestión equilibrada."
  },
  {
    id: "P002",
    name: "Balanceado Cachorro 7.5kg",
    category: "Alimentos",
    price: 0,
    tags: ["cachorro", "growth"],
    img: "img/balanceado-cachorro.png",
    desc: "Fórmula para crecimiento: proteínas y nutrientes para el desarrollo saludable."
  },
  {
    id: "P003",
    name: "Arena Sanitaria Aglomerante 10kg",
    category: "Higiene",
    price: 0,
    tags: ["gato", "arena"],
    img: "img/arena.png",
    desc: "Aglomerante, controla olores y facilita la limpieza diaria."
  },
  {
    id: "P004",
    name: "Shampoo Neutro 500ml",
    category: "Higiene",
    price: 0,
    tags: ["baño", "suave"],
    img: "img/shampoo.png",
    desc: "Limpieza suave para piel sensible. Ideal para uso frecuente."
  },
  {
    id: "P005",
    name: "Antipulgas Spot-On",
    category: "Salud",
    price: 0,
    tags: ["antipulgas", "perro", "gato"],
    img: "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?q=80&w=1200&auto=format&fit=crop",
    desc: "Aplicación práctica. Consultá presentación según peso y especie."
  },
  {
    id: "P006",
    name: "Arnés Anatómico Reforzado",
    category: "Accesorios",
    price: 0,
    tags: ["arnes", "paseo"],
    img: "img/arnes.png",
    desc: "Distribuye mejor la tensión. Cómodo y seguro para paseos diarios."
  },
  {
    id: "P007",
    name: "Heno Premium (Fardo)",
    category: "Forrajes",
    price: 0,
    tags: ["heno", "equinos", "campo"],
    img: "img/heno.png",
    desc: "Forraje seleccionado. Conservación en seco para mantener calidad."
  },
  {
    id: "P008",
    name: "Maíz Partido (Bolsa)",
    category: "Forrajes",
    price: 0,
    tags: ["maiz", "aves", "campo"],
    img: "img/maiz.png",
    desc: "Ideal para suplementación. Consultá disponibilidad y peso por bolsa."
  }
];

// Paginación simple “Ver más”
const PAGE_SIZE = 6;
let currentPage = 1;

let inquiry = []; // productos agregados a consulta

// ============================
// Helpers
// ============================
function buildWhatsAppLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
}

function moneyARS(n) {
  // precios demo en 0 -> mostramos “Consultar”
  if (!n || n <= 0) return "Consultar";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
}

function uniqueCategories(items) {
  return [...new Set(items.map(p => p.category))].sort();
}

// ============================
// Render Products
// ============================
const productsGrid = document.getElementById("productsGrid");
const categorySelect = document.getElementById("categorySelect");
const searchInput = document.getElementById("searchInput");
const btnVerMas = document.getElementById("btnVerMas");

function getFilteredProducts() {
  const q = (searchInput.value || "").toLowerCase().trim();
  const cat = categorySelect.value;

  return PRODUCTS.filter(p => {
    const matchesCat = (cat === "all") || (p.category === cat);
    const haystack = `${p.name} ${p.category} ${p.tags.join(" ")} ${p.desc}`.toLowerCase();
    const matchesQuery = !q || haystack.includes(q);
    return matchesCat && matchesQuery;
  });
}

function renderCategories() {
  const cats = uniqueCategories(PRODUCTS);
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categorySelect.appendChild(opt);
  });
}

function productCardHTML(p) {
  return `
    <div class="col-sm-6 col-lg-4">
      <div class="product-card h-100">
        <div class="pimg-box">
          <img src="${p.img}" alt="${p.name}">
        </div>
        <div class="card-body p-3 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <span class="pbadge"><i class="bi bi-tag"></i> ${p.category}</span>
            <span class="pprice">${moneyARS(p.price)}</span>
          </div>
          <h5 class="fw-bold mb-2">${p.name}</h5>
          <p class="text-muted small mb-3" style="min-height: 40px;">
            ${p.desc}
          </p>

          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-primary w-100"
              data-bs-toggle="modal"
              data-bs-target="#productModal"
              data-product-id="${p.id}">
              <i class="bi bi-eye me-2"></i> Ver detalle
            </button>
            <a class="btn btn-outline-dark"
              target="_blank" rel="noopener"
              href="${buildWhatsAppLink(`Hola! Quiero consultar por: ${p.name} (${p.category}).`) }"
              title="Consultar por WhatsApp">
              <i class="bi bi-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProducts(resetPage = false) {
  if (resetPage) currentPage = 1;

  const filtered = getFilteredProducts();
  const max = currentPage * PAGE_SIZE;
  const toShow = filtered.slice(0, max);

  productsGrid.innerHTML = toShow.map(productCardHTML).join("");

  // Mostrar/ocultar botón ver más
  btnVerMas.style.display = filtered.length > toShow.length ? "inline-flex" : "none";

  // activar animación reveal en cards nuevas
  revealScan();
}

// ============================
// Modal logic
// ============================
const productModal = document.getElementById("productModal");
const mCategory = document.getElementById("mCategory");
const mTitle = document.getElementById("mTitle");
const mImage = document.getElementById("mImage");
const mDesc = document.getElementById("mDesc");
const mPrice = document.getElementById("mPrice");
const btnWhatsappModal = document.getElementById("btnWhatsappModal");
const btnAddToInquiry = document.getElementById("btnAddToInquiry");

let currentModalProduct = null;

productModal.addEventListener("show.bs.modal", (event) => {
  const btn = event.relatedTarget;
  const id = btn?.getAttribute("data-product-id");
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  currentModalProduct = p;

  mCategory.textContent = p.category;
  mTitle.textContent = p.name;
  mImage.src = p.img;
  mImage.alt = p.name;
  mDesc.textContent = p.desc;
  mPrice.textContent = moneyARS(p.price);

  const msg = buildInquiryMessage([p]);
  btnWhatsappModal.href = buildWhatsAppLink(msg);
});

function buildInquiryMessage(list) {
  const lines = list.map((p, idx) => `${idx + 1}) ${p.name} - ${p.category}`);
  return `Hola! Quiero consultar por:\n${lines.join("\n")}\n\n¿Hay stock? ¿Precio final y envío?`;
}

// Toast
const toastEl = document.getElementById("appToast");
const toast = new bootstrap.Toast(toastEl, { delay: 2200 });

btnAddToInquiry.addEventListener("click", () => {
  if (!currentModalProduct) return;

  const exists = inquiry.some(p => p.id === currentModalProduct.id);
  if (!exists) inquiry.push(currentModalProduct);

  toast.show();

  // Actualiza link del modal a “consulta acumulada”
  const msg = buildInquiryMessage(inquiry);
  btnWhatsappModal.href = buildWhatsAppLink(msg);
});

// ============================
// Contact form -> WhatsApp
// ============================
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("cName").value.trim();
  const phone = document.getElementById("cPhone").value.trim();
  const msg = document.getElementById("cMsg").value.trim();

  const finalMsg =
`Hola! Soy ${name}.
Tel: ${phone}
Consulta: ${msg}`;

  window.open(buildWhatsAppLink(finalMsg), "_blank", "noopener");
});

// ============================
// Global WhatsApp buttons
// ============================
function wireWhatsAppButtons() {
  const baseMsg = "Hola! Quiero hacer una consulta. ¿Me ayudás con un pedido?";
  const url = buildWhatsAppLink(baseMsg);

  const ids = [
    "btnWhatsappNav",
    "btnWhatsappHero",
    "btnWhatsappBenefits",
    "btnWhatsappContact",
    "btnWhatsappFloat"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = url;
  });

  const btnMaps = document.getElementById("btnMaps");
  if (btnMaps) btnMaps.href = MAPS_LINK;
}

// ============================
// Animaciones reveal (IntersectionObserver)
// ============================
let observer;

function revealInit() {
  const items = document.querySelectorAll(".reveal");
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
}

function revealScan() {
  // para elementos que se agregan luego (cards)
  const newItems = document.querySelectorAll("#productsGrid .product-card");
  newItems.forEach((card, i) => {
    card.classList.add("reveal");
    card.style.setProperty("--d", `${(i % 6) * 60}ms`);
    observer.observe(card);
  });
}

// ============================
// Events
// ============================
btnVerMas.addEventListener("click", () => {
  currentPage += 1;
  renderProducts(false);
});

searchInput.addEventListener("input", () => renderProducts(true));
categorySelect.addEventListener("change", () => renderProducts(true));

// ============================
// Init
// ============================
document.getElementById("year").textContent = new Date().getFullYear();

renderCategories();
wireWhatsAppButtons();
revealInit();
renderProducts(true);