// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
  const mobileMenu = document.querySelector(".mobile-menu")

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("active")
    })
  }

  // Hero slider
  const heroSlider = document.querySelector(".hero-slider")
  if (heroSlider) {
    const slides = heroSlider.querySelectorAll(".slide")
    const dots = document.querySelectorAll(".slider-dots .dot")
    const prevBtn = document.querySelector(".slider-controls .prev")
    const nextBtn = document.querySelector(".slider-controls .next")

    let currentSlide = 0
    const totalSlides = slides.length

    function showSlide(index) {
      slides.forEach((slide) => slide.classList.remove("active"))
      dots.forEach((dot) => dot.classList.remove("active"))

      slides[index].classList.add("active")
      dots[index].classList.add("active")
      currentSlide = index
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides
      showSlide(currentSlide)
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides
      showSlide(currentSlide)
    }

    // Auto slide
    let slideInterval = setInterval(nextSlide, 5000)

    // Pause on hover
    heroSlider.addEventListener("mouseenter", () => clearInterval(slideInterval))
    heroSlider.addEventListener("mouseleave", () => (slideInterval = setInterval(nextSlide, 5000)))

    // Navigation
    if (nextBtn) nextBtn.addEventListener("click", nextSlide)
    if (prevBtn) prevBtn.addEventListener("click", prevSlide)

    // Dots
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        clearInterval(slideInterval)
        showSlide(index)
        slideInterval = setInterval(nextSlide, 5000)
      })
    })

    // Initial slide
    showSlide(0)
  }

  // Testimonials slider
  const testimonialsSlider = document.querySelector(".testimonials-slider")
  if (testimonialsSlider) {
    const testimonials = testimonialsSlider.querySelectorAll(".testimonial")
    const dots = document.querySelectorAll(".testimonial-dots .dot")

    let currentTestimonial = 0
    const totalTestimonials = testimonials.length

    function showTestimonial(index) {
      testimonials.forEach((testimonial) => testimonial.classList.remove("active"))
      dots.forEach((dot) => dot.classList.remove("active"))

      testimonials[index].classList.add("active")
      dots[index].classList.add("active")
      currentTestimonial = index
    }

    function nextTestimonial() {
      currentTestimonial = (currentTestimonial + 1) % totalTestimonials
      showTestimonial(currentTestimonial)
    }

    // Auto slide
    setInterval(nextTestimonial, 7000)

    // Dots
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => showTestimonial(index))
    })

    // Initial testimonial
    showTestimonial(0)
  }

  // Newsletter form
  const newsletterForm = document.getElementById("newsletter-form")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault()
      const email = this.querySelector('input[type="email"]').value

      // In a real app, you would send this to your backend
      console.log("Newsletter subscription:", email)
      alert("Thank you for subscribing to our newsletter!")
      this.reset()
    })
  }

  // Back to top button
  const backToTopBtn = document.querySelector(".back-to-top")
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add("show")
      } else {
        backToTopBtn.classList.remove("show")
      }
    })

    backToTopBtn.addEventListener("click", (e) => {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  // Initialize cart count
  updateCartCount()
})

// API Configuration
const API_BASE_URL = "https://github-copilot-g9xv.onrender.com/api"

// Helper function for API requests with better error handling
async function makeRequest(url, method = "GET", data = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config = {
    method,
    headers,
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config)

    // Handle different response types
    let result
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      result = await response.json()
    } else {
      result = await response.text()
    }

    if (!response.ok) {
      throw new Error(result.msg || result.message || "Something went wrong")
    }

    return result
  } catch (error) {
    console.error("API request failed:", error)

    // Show user-friendly error messages
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error. Please check your internet connection.")
    }

    throw error
  }
}

// User Authentication
async function registerUser(userData) {
  return makeRequest("/auth/register", "POST", userData)
}

async function loginUser(credentials) {
  return makeRequest("/auth/login", "POST", credentials)
}

async function forgotPassword(email) {
  return makeRequest("/auth/forgot-password", "POST", { email })
}

async function resetPassword(token, newPassword) {
  return makeRequest(`/auth/reset-password/${token}`, "PUT", { password: newPassword })
}

// Product Functions
async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString()
  return makeRequest(`/products?${query}`)
}

async function fetchProductById(id) {
  return makeRequest(`/products/${id}`)
}

async function fetchRelatedProducts(id) {
  return makeRequest(`/products/${id}/related`)
}

// Cart functions
async function fetchCartItems() {
  const token = localStorage.getItem("token")
  if (!token) {
    // Return guest cart from localStorage
    return JSON.parse(localStorage.getItem("guestCart") || "[]")
  }

  try {
    const user = await makeRequest("/users/me", "GET", null, token)
    return user.cart || []
  } catch (error) {
    console.error("Failed to get cart items:", error)
    return JSON.parse(localStorage.getItem("guestCart") || "[]")
  }
}

async function addToCart(item) {
  const token = localStorage.getItem("token")
  if (!token) {
    // Save to localStorage for guests
    const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
    const existingItem = cart.find(
      (cartItem) => cartItem.id === item.id && cartItem.color === item.color && cartItem.size === item.size,
    )

    if (existingItem) {
      existingItem.quantity += item.quantity
    } else {
      cart.push(item)
    }

    localStorage.setItem("guestCart", JSON.stringify(cart))
    updateCartCount()
    return
  }

  // For logged in users
  try {
    await makeRequest("/users/me/cart", "POST", item, token)
    updateCartCount()
  } catch (error) {
    console.error("Failed to add to cart:", error)
    // Fallback to localStorage
    const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
    const existingItem = cart.find(
      (cartItem) => cartItem.id === item.id && cartItem.color === item.color && cartItem.size === item.size,
    )

    if (existingItem) {
      existingItem.quantity += item.quantity
    } else {
      cart.push(item)
    }

    localStorage.setItem("guestCart", JSON.stringify(cart))
    updateCartCount()
  }
}

async function removeFromCart(itemId, color, size) {
  const token = localStorage.getItem("token")
  if (!token) {
    // Remove from localStorage for guests
    let cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
    cart = cart.filter((item) => !(item.id === itemId && item.color === color && item.size === size))

    localStorage.setItem("guestCart", JSON.stringify(cart))
    updateCartCount()
    return
  }

  // For logged in users
  try {
    await makeRequest(`/users/me/cart/${itemId}`, "DELETE", { color, size }, token)
    updateCartCount()
  } catch (error) {
    console.error("Failed to remove from cart:", error)
  }
}

async function updateCartItem(itemId, color, size, quantity) {
  const token = localStorage.getItem("token")
  if (!token) {
    // Update in localStorage for guests
    const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
    const item = cart.find((item) => item.id === itemId && item.color === color && item.size === size)

    if (item) {
      item.quantity = quantity
      localStorage.setItem("guestCart", JSON.stringify(cart))
      updateCartCount()
    }
    return
  }

  // For logged in users
  try {
    await makeRequest(`/users/me/cart/${itemId}`, "PUT", { color, size, quantity }, token)
    updateCartCount()
  } catch (error) {
    console.error("Failed to update cart:", error)
  }
}

// Order Functions
async function createOrder(orderData) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  return makeRequest("/orders", "POST", orderData, token)
}

async function fetchOrders() {
  const token = localStorage.getItem("token")
  if (!token) return []

  return makeRequest("/orders/myorders", "GET", null, token)
}

// User Functions
async function fetchUserProfile() {
  const token = localStorage.getItem("token")
  if (!token) return null

  return makeRequest("/users/me", "GET", null, token)
}

async function updateUserProfile(profileData) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  return makeRequest("/users/me", "PUT", profileData, token)
}

async function updateUserPassword(currentPassword, newPassword) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  return makeRequest("/users/me/password", "PUT", { currentPassword, newPassword }, token)
}

// Wishlist Functions
async function fetchWishlist() {
  const token = localStorage.getItem("token")
  if (!token) return []

  try {
    const user = await makeRequest("/users/me", "GET", null, token)
    return user.wishlist || []
  } catch (error) {
    return []
  }
}

async function addToWishlist(productId) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  return makeRequest(`/users/me/wishlist/${productId}`, "POST", null, token)
}

async function removeFromWishlist(productId) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  return makeRequest(`/users/me/wishlist/${productId}`, "DELETE", null, token)
}

// Update cart count display
async function updateCartCount() {
  const token = localStorage.getItem("token")
  let count = 0

  if (token) {
    try {
      const cartItems = await fetchCartItems()
      count = cartItems.reduce((total, item) => total + item.quantity, 0)
    } catch (error) {
      // Fallback to guest cart
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      count = cart.reduce((total, item) => total + item.quantity, 0)
    }
  } else {
    // For guests
    const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
    count = cart.reduce((total, item) => total + item.quantity, 0)
  }

  const cartCountElements = document.querySelectorAll(".cart-count")
  cartCountElements.forEach((el) => {
    el.textContent = count
  })
}

// Initialize cart count on page load
updateCartCount()

function calculateCartTotals() {
  const cart = fetchCartItems()
  const products = fetchProducts()

  let subtotal = 0

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id)
    if (product) {
      subtotal += product.price * item.quantity
    }
  })

  const shipping = subtotal > 50 ? 0 : 5 // Free shipping over $50
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax

  return {
    subtotal: subtotal,
    shipping: shipping,
    tax: tax,
    total: total,
  }
}

function applyDiscount(percent) {
  // In a real app, you would save this discount to be applied during checkout
  console.log(`Applying ${percent}% discount`)
  // Update the UI to show the discount
}

function setFreeShipping() {
  // In a real app, you would save this to be applied during checkout
  console.log("Applying free shipping")
  // Update the UI to show free shipping
}

// Display functions
function displayProducts(products, containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = ""

  products.forEach((product) => {
    const productCard = document.createElement("div")
    productCard.className = container.classList.contains("products-list") ? "product-list-item" : "product-card"

    // Determine badge
    let badge = ""
    if (product.onSale) {
      badge = `<div class="product-badge sale">Sale</div>`
    } else if (product.isNew) {
      badge = `<div class="product-badge new">New</div>`
    }

    // Rating stars
    const fullStars = Math.floor(product.rating)
    const halfStar = product.rating % 1 >= 0.5 ? 1 : 0
    const emptyStars = 5 - fullStars - halfStar

    let ratingStars = ""
    for (let i = 0; i < fullStars; i++) {
      ratingStars += '<i class="fas fa-star"></i>'
    }
    if (halfStar) {
      ratingStars += '<i class="fas fa-star-half-alt"></i>'
    }
    for (let i = 0; i < emptyStars; i++) {
      ratingStars += '<i class="far fa-star"></i>'
    }

    if (container.classList.contains("products-list")) {
      // List view
      productCard.innerHTML = `
                <div class="product-list-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                    ${badge}
                </div>
                <div class="product-list-details">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.shortDescription}</p>
                    <div class="product-rating">
                        ${ratingStars}
                        <span>(${product.reviewCount})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">$${product.price.toFixed(2)}</span>
                        ${product.oldPrice ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ""}
                    </div>
                    <div class="product-stock ${product.stock > 0 ? "in-stock" : "out-of-stock"}">
                        ${product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </div>
                </div>
                <div class="product-list-actions">
                    <button class="btn btn-primary" onclick="addToCart({
                        id: '${product.id}',
                        name: '${product.name}',
                        price: ${product.price},
                        image: '${product.images[0]}',
                        quantity: 1,
                        color: 'Black',
                        size: 'M'
                    })">Add to Cart</button>
                    <button class="btn btn-outline">View Details</button>
                </div>
            `

      // Add click event to view details button
      productCard.querySelector(".btn-outline").addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}`
      })
    } else {
      // Grid view
      productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                    ${badge}
                    <div class="product-actions">
                        <button title="Add to Wishlist"><i class="far fa-heart"></i></button>
                        <button title="Quick View"><i class="far fa-eye"></i></button>
                        <button title="Add to Cart" onclick="addToCart({
                            id: '${product.id}',
                            name: '${product.name}',
                            price: ${product.price},
                            image: '${product.images[0]}',
                            quantity: 1,
                            color: 'Black',
                            size: 'M'
                        })"><i class="fas fa-shopping-cart"></i></button>
                    </div>
                </div>
                <div class="product-details">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">$${product.price.toFixed(2)}</span>
                        ${product.oldPrice ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ""}
                    </div>
                    <div class="product-rating">
                        ${ratingStars}
                        <span>(${product.reviewCount})</span>
                    </div>
                </div>
            `

      // Add click event to the whole card to view details
      productCard.addEventListener("click", (e) => {
        // Don't navigate if a button was clicked
        if (!e.target.closest("button")) {
          window.location.href = `product.html?id=${product.id}`
        }
      })
    }

    container.appendChild(productCard)
  })
}

function displayCartItems() {
  const container = document.getElementById("cart-items")
  if (!container) return

  const cart = fetchCartItems()
  const products = fetchProducts()

  container.innerHTML = ""

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty</p>"
    return
  }

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id)
    if (!product) return

    const cartItem = document.createElement("div")
    cartItem.className = "cart-item"
    cartItem.dataset.id = item.id

    cartItem.innerHTML = `
            <div class="item-product">
                <div class="item-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="item-details">
                    <h4>${product.name}</h4>
                    <p class="item-color">${item.color}</p>
                    <p class="item-size">${item.size}</p>
                    <button class="btn-text item-remove" onclick="removeFromCart('${item.id}', '${item.color}', '${item.size}')">
                        <i class="far fa-trash-alt"></i> Remove
                    </button>
                </div>
            </div>
            <div class="item-price">$${product.price.toFixed(2)}</div>
            <div class="item-quantity">
                <div class="quantity-selector">
                    <button class="qty-btn minus" onclick="this.nextElementSibling.stepDown(); updateCartItem('${item.id}', '${item.color}', '${item.size}', this.nextElementSibling.value)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" 
                        onchange="updateCartItem('${item.id}', '${item.color}', '${item.size}', this.value)">
                    <button class="qty-btn plus" onclick="this.previousElementSibling.stepUp(); updateCartItem('${item.id}', '${item.color}', '${item.size}', this.previousElementSibling.value)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="item-total">$${(product.price * item.quantity).toFixed(2)}</div>
            <div class="item-action">
                <button class="btn-text" onclick="removeFromCart('${item.id}', '${item.color}', '${item.size}')">
                    <i class="far fa-trash-alt"></i>
                </button>
            </div>
        `

    container.appendChild(cartItem)
  })
}

function updateCartTotals() {
  const totals = calculateCartTotals()

  // Update cart page
  if (document.getElementById("cart-subtotal")) {
    document.getElementById("cart-subtotal").textContent = `$${totals.subtotal.toFixed(2)}`
    document.getElementById("cart-shipping").textContent = `$${totals.shipping.toFixed(2)}`
    document.getElementById("cart-tax").textContent = `$${totals.tax.toFixed(2)}`
    document.getElementById("cart-total").textContent = `$${totals.total.toFixed(2)}`
  }

  // Update checkout page
  if (document.getElementById("sidebar-subtotal")) {
    document.getElementById("sidebar-subtotal").textContent = `$${totals.subtotal.toFixed(2)}`
    document.getElementById("sidebar-shipping").textContent = `$${totals.shipping.toFixed(2)}`
    document.getElementById("sidebar-tax").textContent = `$${totals.tax.toFixed(2)}`
    document.getElementById("sidebar-total").textContent = `$${totals.total.toFixed(2)}`

    document.getElementById("review-subtotal").textContent = `$${totals.subtotal.toFixed(2)}`
    document.getElementById("review-shipping").textContent = `$${totals.shipping.toFixed(2)}`
    document.getElementById("review-tax").textContent = `$${totals.tax.toFixed(2)}`
    document.getElementById("review-total").textContent = `$${totals.total.toFixed(2)}`
  }
}

// Product functions
const mockProducts = [
  {
    id: "1",
    name: "Wireless Headphones",
    category: "electronics",
    price: 99.99,
    oldPrice: 129.99,
    rating: 4.5,
    reviewCount: 24,
    stock: 45,
    shortDescription: "Premium wireless headphones with noise cancellation",
    description:
      "These premium wireless headphones feature active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and frequent travelers.",
    images: ["images/product1.jpg", "images/product1-2.jpg", "images/product1-3.jpg"],
    onSale: true,
    isNew: false,
    dateAdded: "2023-02-15",
  },
  {
    id: "2",
    name: "Smart Watch",
    category: "electronics",
    price: 199.99,
    rating: 4.2,
    reviewCount: 18,
    stock: 32,
    shortDescription: "Feature-packed smartwatch with health monitoring",
    description:
      "Stay connected and monitor your health with this feature-packed smartwatch. Includes heart rate monitoring, GPS, water resistance, and 7-day battery life.",
    images: ["images/product2.jpg", "images/product2-2.jpg", "images/product2-3.jpg"],
    onSale: false,
    isNew: true,
    dateAdded: "2023-03-10",
  },
  {
    id: "3",
    name: "Running Shoes",
    category: "fashion",
    price: 79.99,
    rating: 4.7,
    reviewCount: 36,
    stock: 0,
    shortDescription: "Lightweight running shoes with cushioning technology",
    description:
      "These lightweight running shoes feature advanced cushioning technology for maximum comfort during your runs. Breathable mesh upper provides excellent ventilation.",
    images: ["images/product3.jpg", "images/product3-2.jpg", "images/product3-3.jpg"],
    onSale: false,
    isNew: false,
    dateAdded: "2023-01-20",
  },
  {
    id: "4",
    name: "Bluetooth Speaker",
    category: "electronics",
    price: 59.99,
    oldPrice: 79.99,
    rating: 4.0,
    reviewCount: 12,
    stock: 18,
    shortDescription: "Portable Bluetooth speaker with 20-hour battery",
    description:
      "Take your music anywhere with this portable Bluetooth speaker. Features 20-hour battery life, waterproof design, and powerful sound in a compact package.",
    images: ["images/product4.jpg", "images/product4-2.jpg", "images/product4-3.jpg"],
    onSale: true,
    isNew: false,
    dateAdded: "2023-02-28",
  },
  {
    id: "5",
    name: "Backpack",
    category: "fashion",
    price: 49.99,
    rating: 4.3,
    reviewCount: 15,
    stock: 27,
    shortDescription: "Durable backpack with laptop compartment",
    description:
      "This durable backpack features a padded laptop compartment, multiple pockets for organization, and comfortable shoulder straps. Perfect for work or travel.",
    images: ["images/product5.jpg", "images/product5-2.jpg", "images/product5-3.jpg"],
    onSale: false,
    isNew: true,
    dateAdded: "2023-03-15",
  },
  {
    id: "6",
    name: "Fitness Tracker",
    category: "electronics",
    price: 89.99,
    oldPrice: 99.99,
    rating: 4.1,
    reviewCount: 21,
    stock: 14,
    shortDescription: "Track your fitness goals with this advanced tracker",
    description:
      "Monitor your steps, calories burned, sleep patterns, and more with this advanced fitness tracker. Water-resistant design and 10-day battery life.",
    images: ["images/product6.jpg", "images/product6-2.jpg", "images/product6-3.jpg"],
    onSale: true,
    isNew: false,
    dateAdded: "2023-01-10",
  },
  {
    id: "7",
    name: "Denim Jacket",
    category: "fashion",
    price: 69.99,
    rating: 4.4,
    reviewCount: 8,
    stock: 22,
    shortDescription: "Classic denim jacket for men and women",
    description:
      "This classic denim jacket features a timeless design suitable for both men and women. Made from high-quality denim for durability and comfort.",
    images: ["images/product7.jpg", "images/product7-2.jpg", "images/product7-3.jpg"],
    onSale: false,
    isNew: true,
    dateAdded: "2023-03-05",
  },
  {
    id: "8",
    name: "Coffee Maker",
    category: "home",
    price: 129.99,
    rating: 4.6,
    reviewCount: 17,
    stock: 9,
    shortDescription: "Programmable coffee maker with thermal carafe",
    description:
      "Wake up to freshly brewed coffee with this programmable coffee maker. Features a thermal carafe to keep coffee hot for hours and a 24-hour programmable timer.",
    images: ["images/product8.jpg", "images/product8-2.jpg", "images/product8-3.jpg"],
    onSale: false,
    isNew: false,
    dateAdded: "2023-02-01",
  },
]

function getFeaturedProducts() {
  return mockProducts.filter((product) => product.rating >= 4.5 || product.isNew).slice(0, 8)
}

// Initialize featured products on home page
if (document.getElementById("featured-products")) {
  const featuredProducts = getFeaturedProducts()
  displayProducts(featuredProducts, "featured-products")
}
