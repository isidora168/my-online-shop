document.addEventListener('DOMContentLoaded', () => {
  loadCartFromLocalStorage(); // Ucitaj sacuvanu korpu iz LocalStorage
  loadProducts(); // Ucitaj proizvode sa JSON fajla
});

let allProducts = [];


// Funkcija za ucitavanje proizvoda iz JSON fajla
async function loadProducts() {
  try {
    const response = await fetch('products.json'); // Putanja do JSON fajla
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    // Ucitavanje podataka u niz
    const productData = await response.json();
    const products = productData.products.data.items;
    allProducts = productData.products.data.items;
    const currentPage = window.location.pathname;

    if (currentPage.includes('products.html')) {
      displayProducts(products); // Prolazak kroz stavke proizvoda na products.html
      
      // Event listener za sortiranje
      document.getElementById('sort').addEventListener('change', function() {
      const sortValue = this.value;

      if (sortValue === 'price-asc') {
          allProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); // Sortiranje po ceni rastuce
      } else if (sortValue === 'price-desc') {
          allProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); // Sortiranje po ceni opadajuce
      } 

      displayProducts(allProducts); // Ponovni prikaz proizvoda nakon sortiranja
      });
    } else if (currentPage.includes('product-details.html')) {
      displayProductDetails(products); // Prikaz pojedinacnog proizvoda na product-details.html
    }
  } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
  }
}

// Funkcija za prikaz proizvoda na products.html
function displayProducts(products) {
  const productList = document.getElementById('product-list');

  if (productList) {
    productList.innerHTML = ''; // Ocisti prethodni sadrzaj
    
    // Kreiranje prikaza za svaki proizvod
    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');

      productCard.innerHTML = `
        <img src="${product.images && product.images.length > 0 ? product.images[0] : 'default-image.jpg'}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p><strong>Cena: ${product.price} RSD</strong></p>
        <a href="product-details.html?id=${product.id}" class="more-btn">Details</a>
        <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to cart</button>`;

      productList.appendChild(productCard);
    });
  }
}


// Prikaz proizvoda na stranici product-details.html
function displayProductDetails(products) {
  const productId = getProductIdFromURL(); // Preuzmi ID iz URL-a
  const product = products.find(p => p.id === productId); // Pronadji proizvod po ID-u

  if (product) {
    const productDetailsContainer = document.getElementById('product-details');
    if (productDetailsContainer) {
        productDetailsContainer.innerHTML = `
          <img src="${product.images[0]}" alt="${product.name}">
          <h2>${product.name}</h2>
          <p><strong>Cena: ${product.price} RSD</strong></p>
          <p>${product.description}</p>
          <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to cart</button>
          <a href="products.html" class="back-btn">Back to products</a>`;
    }
  }
}

// Funkcija za preuzimanje ID-a iz URL-a
function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Korpa za kupovinu
let cart = [];

// Funkcija za dodavanje proizvoda u korpu
function addToCart(event) {
  // Preuzimanje podataka o proizvodu
  const button = event.target;
  const id = button.getAttribute('data-id');
  const name = button.getAttribute('data-name');
  const price = parseFloat(button.getAttribute('data-price'));

  const existingProduct = cart.find(item => item.id === id);

  // Ako je proizvod vec u korpi, povecaj kolicinu, u suprotnom, dodaj ga u korpu
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  alert("Your product is in cart!");

  saveCartToLocalStorage(); // Cuvanje korpe u LocalStorage
  updateCart();
}

// Funkcija za uklanjanje proizvoda iz korpe
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id); // Filtriranje proizvoda da bi se uklonio onaj sa odgovarajućim ID-em
  saveCartToLocalStorage(); // Azuriranje LocalStorage nakon uklanjanja
  updateCart(); // Azuriranje korpe
}

// Funkcija za azuriranje prikaza korpe
function updateCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = ''; // Ocisti trenutni prikaz korpe

  let total = 0;

  // Kreiranje izgleda korpe sa svim proizvodima
  cart.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `${item.name} x ${item.quantity} - ${item.price * item.quantity} RSD
    <button class="remove-from-cart-btn" data-id="${item.id}">Remove</button>`;
    cartItems.appendChild(li);

    // Azuriranje vrednosti korpe
    total += item.price * item.quantity;
  });

  cartTotal.textContent = total.toFixed(2);

  // Dodavanje event listener-a za dugmad za uklanjanje proizvoda
  const removeButtons = document.querySelectorAll('.remove-from-cart-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      removeFromCart(id);
    });
  });
}

// Event listener za Add to Cart dugmad
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('add-to-cart')) {
    addToCart(event); // Poziv funkcije addToCart kada se klikne dugme
  }
});

// Funkcija za otvaranje korpe
function openCart() {
  const cart = document.getElementById('cart');
  cart.classList.add('cart-open'); // Prikazivanje korpe
}

// Funkcija za zatvaranje korpe
function closeCart() {
  const cart = document.getElementById('cart');
  cart.classList.remove('cart-open'); // Sakrivanje korpe
}

// Event listener za ikonu korpe
const cartButton = document.querySelector('.fa-shopping-cart');
if (cartButton) {
  cartButton.addEventListener('click', openCart);
}

// Event listener za dugme za zatvaranje korpe
const closeCartButton = document.getElementById('close-cart');
if (closeCartButton) {
  closeCartButton.addEventListener('click', closeCart);
}

// Funkcija za cuvanje korpe u LocalStorage
function saveCartToLocalStorage() {
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Funkcija za ucitavanje korpe iz LocalStorage
function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('shoppingCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCart(); // Azuriranje korpe sa ucitanim proizvodima
  }
}

// Pretraga proizvoda
document.getElementById('search').addEventListener('input', function(event) {
  const searchTerm = event.target.value.trim();
  const filteredProducts = allProducts.filter(product => product.name === searchTerm);
  displayProducts(filteredProducts); // Prikaz samo filtriranih proizvoda
});