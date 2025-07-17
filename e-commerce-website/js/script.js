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

// Loading indicator functions
function showLoading(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    `
  }
}

function hideLoading() {
  document.querySelectorAll(".loading-spinner").forEach((spinner) => {
    spinner.remove()
  })
}

// Toast notification system
function showToast(message, type = "info") {
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
      <span>${message}</span>
    </div>
    <button class="toast-close">&times;</button>
  `

  document.body.appendChild(toast)

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.remove()
  }, 5000)

  // Manual close
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.remove()
  })
}

// User Authentication
async function registerUser(userData) {
  try {
    const result = await makeRequest("/auth/register", "POST", userData)
    showToast("Registration successful!", "success")
    return result
  } catch (error) {
    showToast(error.message, "error")
    throw error
  }
}

async function loginUser(credentials) {
  try {
    const result = await makeRequest("/auth/login", "POST", credentials)
    showToast("Login successful!", "success")
    return result
  } catch (error) {
    showToast(error.message, "error")
    throw error
  }
}

async function forgotPassword(email) {
  try {
    const result = await makeRequest("/auth/forgot-password", "POST", { email })
    showToast("Password reset link sent to your email", "success")
    return result
  } catch (error) {
    showToast(error.message, "error")
    throw error
  }
}

async function resetPassword(token, newPassword) {
  try {
    const result = await makeRequest(`/auth/reset-password/${token}`, "PUT", { password: newPassword })
    showToast("Password reset successful!", "success")
    return result
  } catch (error) {
    showToast(error.message, "error")
    throw error
  }
}

// Product Functions
async function getProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString()
    return await makeRequest(`/products?${query}`)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    // Return mock data as fallback
    return getMockProducts()
  }
}

async function getProductById(id) {
  try {
    return await makeRequest(`/products/${id}`)
  } catch (error) {
    console.error("Failed to fetch product:", error)
    // Return mock product as fallback
    return getMockProducts().find((p) => p._id === id || p.id === id)
  }
}

async function getRelatedProducts(id, category) {
  try {
    return await makeRequest(`/products/${id}/related`)
  } catch (error) {
    console.error("Failed to fetch related products:", error)
    // Return mock related products as fallback
    return getMockProducts()
      .filter((p) => p.category === category && p.id !== id)
      .slice(0, 4)
  }
}

async function searchProducts(query) {
  try {
    return await makeRequest(`/products/search?q=${encodeURIComponent(query)}`)
  } catch (error) {
    console.error("Failed to search products:", error)
    // Return filtered mock products as fallback
    const mockProducts = getMockProducts()
    return mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()),
    )
  }
}

// Cart Functions
async function getCartItems() {
  const token = localStorage.getItem("token")
  if (!token) {
    return JSON.parse(localStorage.getItem("guestCart") || "[]")
  }

  try {
    const result = await makeRequest("/cart", "GET", null, token)
    return result.items || []
  } catch (error) {
    console.error("Failed to get cart items:", error)
    return JSON.parse(localStorage.getItem("guestCart") || "[]")
  }
}

async function addToCart(item) {
  const token = localStorage.getItem("token")

  if (!token) {
    // Guest cart
    const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
    const existingItem = cart.find(
      (cartItem) =>
        cartItem.productId === item.productId && cartItem.color === item.color && cartItem.size === item.size,
    )

    if (existingItem) {
      existingItem.quantity += item.quantity
    } else {
      cart.push({
        ...item,
        id: Date.now().toString(),
      })
    }

    localStorage.setItem("guestCart", JSON.stringify(cart))
    updateCartCount()
    showToast("Product added to cart!", "success")
    return
  }

  try {
    await makeRequest("/cart/add", "POST", item, token)
    updateCartCount()
    showToast("Product added to cart!", "success")
  } catch (error) {
    console.error("Failed to add to cart:", error)
    showToast("Failed to add product to cart", "error")
  }
}

async function removeFromCart(itemId) {
  const token = localStorage.getItem("token")

  if (!token) {
    let cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
    cart = cart.filter((item) => item.id !== itemId)
    localStorage.setItem("guestCart", JSON.stringify(cart))
    updateCartCount()
    showToast("Product removed from cart", "success")
    return
  }

  try {
    await makeRequest(`/cart/remove/${itemId}`, "DELETE", null, token)
    updateCartCount()
    showToast("Product removed from cart", "success")
  } catch (error) {
    console.error("Failed to remove from cart:", error)
    showToast("Failed to remove product from cart", "error")
  }
}

async function updateCartItem(itemId, quantity) {
  const token = localStorage.getItem("token")

  if (!token) {
    const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
    const item = cart.find((item) => item.id === itemId)
    if (item) {
      item.quantity = quantity
      localStorage.setItem("guestCart", JSON.stringify(cart))
      updateCartCount()
    }
    return
  }

  try {
    await makeRequest(`/cart/update/${itemId}`, "PUT", { quantity }, token)
    updateCartCount()
  } catch (error) {
    console.error("Failed to update cart:", error)
    showToast("Failed to update cart", "error")
  }
}

async function clearCart() {
  const token = localStorage.getItem("token")

  if (!token) {
    localStorage.removeItem("guestCart")
    updateCartCount()
    return
  }

  try {
    await makeRequest("/cart/clear", "DELETE", null, token)
    updateCartCount()
  } catch (error) {
    console.error("Failed to clear cart:", error)
  }
}

// Order Functions
async function createOrder(orderData) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  try {
    const result = await makeRequest("/orders", "POST", orderData, token)
    showToast("Order placed successfully!", "success")
    await clearCart()
    return result
  } catch (error) {
    showToast("Failed to place order", "error")
    throw error
  }
}

async function getOrders() {
  const token = localStorage.getItem("token")
  if (!token) return []

  try {
    return await makeRequest("/orders", "GET", null, token)
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return []
  }
}

async function getOrderById(orderId) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  try {
    return await makeRequest(`/orders/${orderId}`, "GET", null, token)
  } catch (error) {
    console.error("Failed to fetch order:", error)
    throw error
  }
}

// User Functions
async function getUserProfile() {
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    return await makeRequest("/users/profile", "GET", null, token)
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return null
  }
}

async function updateUserProfile(profileData) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  try {
    const result = await makeRequest("/users/profile", "PUT", profileData, token)
    showToast("Profile updated successfully!", "success")
    return result
  } catch (error) {
    showToast("Failed to update profile", "error")
    throw error
  }
}

async function updateUserPassword(currentPassword, newPassword) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  try {
    const result = await makeRequest("/users/change-password", "PUT", { currentPassword, newPassword }, token)
    showToast("Password updated successfully!", "success")
    return result
  } catch (error) {
    showToast("Failed to update password", "error")
    throw error
  }
}

// Wishlist Functions
async function getWishlist() {
  const token = localStorage.getItem("token")
  if (!token) return []

  try {
    const result = await makeRequest("/wishlist", "GET", null, token)
    return result.items || []
  } catch (error) {
    console.error("Failed to fetch wishlist:", error)
    return []
  }
}

async function addToWishlist(productId) {
  const token = localStorage.getItem("token")
  if (!token) {
    showToast("Please login to add items to wishlist", "error")
    return
  }

  try {
    await makeRequest("/wishlist/add", "POST", { productId }, token)
    showToast("Product added to wishlist!", "success")
  } catch (error) {
    showToast("Failed to add to wishlist", "error")
  }
}

async function removeFromWishlist(productId) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  try {
    await makeRequest(`/wishlist/remove/${productId}`, "DELETE", null, token)
    showToast("Product removed from wishlist", "success")
  } catch (error) {
    showToast("Failed to remove from wishlist", "error")
  }
}

// Review Functions
async function getProductReviews(productId) {
  try {
    return await makeRequest(`/products/${productId}/reviews`)
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    return []
  }
}

async function addProductReview(productId, reviewData) {
  const token = localStorage.getItem("token")
  if (!token) {
    showToast("Please login to add a review", "error")
    return
  }

  try {
    const result = await makeRequest(`/products/${productId}/reviews`, "POST", reviewData, token)
    showToast("Review added successfully!", "success")
    return result
  } catch (error) {
    showToast("Failed to add review", "error")
  }
}

// Address Functions
async function getUserAddresses() {
  const token = localStorage.getItem("token")
  if (!token) return []

  try {
    return await makeRequest("/users/addresses", "GET", null, token)
  } catch (error) {
    console.error("Failed to fetch addresses:", error)
    return []
  }
}

async function addUserAddress(addressData) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  try {
    const result = await makeRequest("/users/addresses", "POST", addressData, token)
    showToast("Address added successfully!", "success")
    return result
  } catch (error) {
    showToast("Failed to add address", "error")
  }
}

async function updateUserAddress(addressId, addressData) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  try {
    const result = await makeRequest(`/users/addresses/${addressId}`, "PUT", addressData, token)
    showToast("Address updated successfully!", "success")
    return result
  } catch (error) {
    showToast("Failed to update address", "error")
  }
}

async function deleteUserAddress(addressId) {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("User not authenticated")

  try {
    await makeRequest(`/users/addresses/${addressId}`, "DELETE", null, token)
    showToast("Address deleted successfully!", "success")
  } catch (error) {
    showToast("Failed to delete address", "error")
  }
}

// Newsletter subscription
async function subscribeNewsletter(email) {
  try {
    await makeRequest("/newsletter/subscribe", "POST", { email })
    showToast("Successfully subscribed to newsletter!", "success")
  } catch (error) {
    showToast("Failed to subscribe to newsletter", "error")
    throw error
  }
}

// Contact form submission
async function submitContactForm(formData) {
  try {
    await makeRequest("/contact", "POST", formData)
    showToast("Message sent successfully!", "success")
  } catch (error) {
    showToast("Failed to send message", "error")
    throw error
  }
}

// Update cart count display
async function updateCartCount() {
  try {
    const cartItems = await getCartItems()
    const count = cartItems.reduce((total, item) => total + item.quantity, 0)

    const cartCountElements = document.querySelectorAll(".cart-count")
    cartCountElements.forEach((el) => {
      el.textContent = count
    })
  } catch (error) {
    console.error("Failed to update cart count:", error)
  }
}

// Calculate cart totals
async function calculateCartTotals() {
  try {
    const cartItems = await getCartItems()
    let subtotal = 0

    for (const item of cartItems) {
      const product = await getProductById(item.productId)
      if (product) {
        subtotal += product.price * item.quantity
      }
    }

    const shipping = subtotal > 50 ? 0 : 5
    const tax = subtotal * 0.1
    const total = subtotal + shipping + tax

    return {
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: total,
    }
  } catch (error) {
    console.error("Failed to calculate cart totals:", error)
    return { subtotal: 0, shipping: 0, tax: 0, total: 0 }
  }
}

// Display functions
async function displayProducts(products, containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  if (!products || products.length === 0) {
    container.innerHTML = '<p class="no-products">No products found</p>'
    return
  }

  container.innerHTML = ""

  for (const product of products) {
    const productCard = document.createElement("div")
    productCard.className = container.classList.contains("products-list") ? "product-list-item" : "product-card"

    // Check if user is logged in for wishlist functionality
    const token = localStorage.getItem("token")
    const wishlistBtn = token
      ? `<button title="Add to Wishlist" onclick="addToWishlist('${product._id || product.id}')"><i class="far fa-heart"></i></button>`
      : `<button title="Login to add to wishlist" onclick="showToast('Please login to add to wishlist', 'error')"><i class="far fa-heart"></i></button>`

    // Determine badge
    let badge = ""
    if (product.onSale || product.salePrice) {
      badge = `<div class="product-badge sale">Sale</div>`
    } else if (product.isNew || isNewProduct(product.createdAt)) {
      badge = `<div class="product-badge new">New</div>`
    }

    // Rating stars
    const rating = product.averageRating || product.rating || 0
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5 ? 1 : 0
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

    const productPrice = product.salePrice || product.price
    const originalPrice = product.salePrice ? product.price : null

    if (container.classList.contains("products-list")) {
      // List view
      productCard.innerHTML = `
        <div class="product-list-image">
          <img src="${product.images?.[0] || "/placeholder.svg?height=200&width=200"}" alt="${product.name}" loading="lazy">
          ${badge}
        </div>
        <div class="product-list-details">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description?.substring(0, 100)}...</p>
          <div class="product-rating">
            ${ratingStars}
            <span>(${product.reviewCount || 0})</span>
          </div>
          <div class="product-price">
            <span class="current-price">$${productPrice?.toFixed(2)}</span>
            ${originalPrice ? `<span class="old-price">$${originalPrice.toFixed(2)}</span>` : ""}
          </div>
          <div class="product-stock ${(product.stock || product.quantity) > 0 ? "in-stock" : "out-of-stock"}">
            ${(product.stock || product.quantity) > 0 ? "In Stock" : "Out of Stock"}
          </div>
        </div>
        <div class="product-list-actions">
          <button class="btn btn-primary" onclick="handleAddToCart('${product._id || product.id}', '${product.name}', ${productPrice})">
            Add to Cart
          </button>
          <button class="btn btn-outline" onclick="window.location.href='product.html?id=${product._id || product.id}'">
            View Details
          </button>
        </div>
      `
    } else {
      // Grid view
      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.images?.[0] || "/placeholder.svg?height=200&width=200"}" alt="${product.name}" loading="lazy">
          ${badge}
          <div class="product-actions">
            ${wishlistBtn}
            <button title="Quick View" onclick="openQuickView('${product._id || product.id}')"><i class="far fa-eye"></i></button>
            <button title="Add to Cart" onclick="handleAddToCart('${product._id || product.id}', '${product.name}', ${productPrice})">
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>
        </div>
        <div class="product-details">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">
            <span class="current-price">$${productPrice?.toFixed(2)}</span>
            ${originalPrice ? `<span class="old-price">$${originalPrice.toFixed(2)}</span>` : ""}
          </div>
          <div class="product-rating">
            ${ratingStars}
            <span>(${product.reviewCount || 0})</span>
          </div>
        </div>
      `

      // Add click event to the whole card to view details
      productCard.addEventListener("click", (e) => {
        if (!e.target.closest("button")) {
          window.location.href = `product.html?id=${product._id || product.id}`
        }
      })
    }

    container.appendChild(productCard)
  }
}

// Helper function to handle add to cart
async function handleAddToCart(productId, productName, price) {
  try {
    await addToCart({
      productId: productId,
      quantity: 1,
      color: "Default",
      size: "Default",
    })
  } catch (error) {
    console.error("Failed to add to cart:", error)
  }
}

// Quick view modal
function openQuickView(productId) {
  // Implementation for quick view modal
  showToast("Quick view feature coming soon!", "info")
}

// Helper function to check if product is new
function isNewProduct(createdAt) {
  if (!createdAt) return false
  const productDate = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now - productDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 30 // Consider products new if created within 30 days
}

// Display cart items
async function displayCartItems() {
  const container = document.getElementById("cart-items")
  if (!container) return

  showLoading("cart-items")

  try {
    const cartItems = await getCartItems()

    if (cartItems.length === 0) {
      container.innerHTML = '<p class="empty-cart">Your cart is empty</p>'
      return
    }

    container.innerHTML = ""

    for (const item of cartItems) {
      const product = await getProductById(item.productId)
      if (!product) continue

      const cartItem = document.createElement("div")
      cartItem.className = "cart-item"
      cartItem.dataset.id = item.id || item._id

      cartItem.innerHTML = `
        <div class="item-product">
          <div class="item-image">
            <img src="${product.images?.[0] || "/placeholder.svg?height=80&width=80"}" alt="${product.name}">
          </div>
          <div class="item-details">
            <h4>${product.name}</h4>
            <p class="item-color">${item.color || "Default"}</p>
            <p class="item-size">${item.size || "Default"}</p>
          </div>
        </div>
        <div class="item-price">$${product.price?.toFixed(2)}</div>
        <div class="item-quantity">
          <div class="quantity-selector">
            <button class="qty-btn minus" onclick="updateQuantity('${item.id || item._id}', ${item.quantity - 1})">
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1" 
              onchange="updateQuantity('${item.id || item._id}', this.value)">
            <button class="qty-btn plus" onclick="updateQuantity('${item.id || item._id}', ${item.quantity + 1})">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="item-total">$${(product.price * item.quantity).toFixed(2)}</div>
        <div class="item-action">
          <button class="btn-text" onclick="removeFromCart('${item.id || item._id}')">
            <i class="far fa-trash-alt"></i>
          </button>
        </div>
      `

      container.appendChild(cartItem)
    }

    await updateCartTotals()
  } catch (error) {
    console.error("Failed to display cart items:", error)
    container.innerHTML = '<p class="error">Failed to load cart items</p>'
  }
}

// Update quantity helper
async function updateQuantity(itemId, newQuantity) {
  if (newQuantity < 1) {
    await removeFromCart(itemId)
    return
  }

  await updateCartItem(itemId, newQuantity)
  await displayCartItems()
}

// Update cart totals display
async function updateCartTotals() {
  try {
    const totals = await calculateCartTotals()

    // Update cart page
    const elements = {
      "cart-subtotal": totals.subtotal,
      "cart-shipping": totals.shipping,
      "cart-tax": totals.tax,
      "cart-total": totals.total,
      "sidebar-subtotal": totals.subtotal,
      "sidebar-shipping": totals.shipping,
      "sidebar-tax": totals.tax,
      "sidebar-total": totals.total,
      "review-subtotal": totals.subtotal,
      "review-shipping": totals.shipping,
      "review-tax": totals.tax,
      "review-total": totals.total,
    }

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id)
      if (element) {
        element.textContent = `$${value.toFixed(2)}`
      }
    })
  } catch (error) {
    console.error("Failed to update cart totals:", error)
  }
}

// Mock products for fallback
function getMockProducts() {
  return [
    {
      id: "1",
      _id: "1",
      name: "Wireless Headphones",
      category: "electronics",
      price: 99.99,
      salePrice: null,
      rating: 4.5,
      reviewCount: 24,
      stock: 45,
      description: "Premium wireless headphones with noise cancellation and 30-hour battery life.",
      images: ["/placeholder.svg?height=200&width=200"],
      onSale: false,
      isNew: false,
      createdAt: "2023-02-15",
    },
    {
      id: "2",
      _id: "2",
      name: "Smart Watch",
      category: "electronics",
      price: 199.99,
      salePrice: null,
      rating: 4.2,
      reviewCount: 18,
      stock: 32,
      description: "Feature-packed smartwatch with health monitoring and GPS.",
      images: ["/placeholder.svg?height=200&width=200"],
      onSale: false,
      isNew: true,
      createdAt: "2023-03-10",
    },
  ]
}

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize cart count
  await updateCartCount()

  // Check if user is logged in
  const token = localStorage.getItem("token")
  if (token) {
    try {
      const user = await getUserProfile()
      if (user) {
        updateUserUI(user)
      }
    } catch (error) {
      // Token might be expired
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  }

  // Initialize page-specific functionality
  initializePageFeatures()
})

// Update UI for logged in user
function updateUserUI(user) {
  const userLinks = document.querySelectorAll(".user-link")
  userLinks.forEach((link) => {
    link.innerHTML = `<i class="far fa-user"></i> ${user.name}`
    link.href = "dashboard.html"
  })
}

// Initialize page-specific features
function initializePageFeatures() {
  const currentPage = window.location.pathname.split("/").pop()

  switch (currentPage) {
    case "index.html":
    case "":
      initializeHomePage()
      break
    case "shop.html":
      initializeShopPage()
      break
    case "product.html":
      initializeProductPage()
      break
    case "cart.html":
      initializeCartPage()
      break
    case "checkout.html":
      initializeCheckoutPage()
      break
    case "login.html":
      initializeAuthPage()
      break
    case "dashboard.html":
      initializeDashboardPage()
      break
    case "contact.html":
      initializeContactPage()
      break
  }
}

// Page initialization functions
async function initializeHomePage() {
  try {
    const featuredProducts = await getProducts({ featured: true, limit: 8 })
    await displayProducts(featuredProducts, "featured-products")
  } catch (error) {
    console.error("Failed to load featured products:", error)
  }

  // Newsletter subscription
  const newsletterForm = document.getElementById("newsletter-form")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async function (e) {
      e.preventDefault()
      const email = this.querySelector('input[type="email"]').value

      try {
        await subscribeNewsletter(email)
        this.reset()
      } catch (error) {
        console.error("Newsletter subscription failed:", error)
      }
    })
  }

  // Initialize sliders
  initializeHeroSlider()
  initializeTestimonialSlider()
}

async function initializeShopPage() {
  const params = new URLSearchParams(window.location.search)
  const category = params.get("category")

  const queryParams = {}
  if (category) {
    queryParams.category = category
    document.querySelector(".page-header h1").textContent = category.charAt(0).toUpperCase() + category.slice(1)
  }

  showLoading("all-products")

  try {
    const products = await getProducts(queryParams)
    await displayProducts(products, "all-products")
  } catch (error) {
    console.error("Failed to load products:", error)
    document.getElementById("all-products").innerHTML =
      '<p class="error">Failed to load products. Please try again later.</p>'
  }

  // Initialize filters and sorting
  initializeShopFilters(queryParams)
}

async function initializeProductPage() {
  const params = new URLSearchParams(window.location.search)
  const productId = params.get("id")

  if (!productId) {
    window.location.href = "shop.html"
    return
  }

  try {
    const product = await getProductById(productId)
    if (!product) {
      window.location.href = "shop.html"
      return
    }

    displayProductDetails(product)
    loadProductReviews(productId)
    loadRelatedProducts(productId, product.category)
  } catch (error) {
    console.error("Failed to load product:", error)
    window.location.href = "shop.html"
  }
}

async function initializeCartPage() {
  await displayCartItems()

  // Update cart button
  const updateCartBtn = document.getElementById("update-cart")
  if (updateCartBtn) {
    updateCartBtn.addEventListener("click", async () => {
      await displayCartItems()
      showToast("Cart updated!", "success")
    })
  }

  // Apply coupon
  const applyCouponBtn = document.getElementById("apply-coupon")
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", () => {
      const couponCode = document.getElementById("coupon-code").value
      applyCoupon(couponCode)
    })
  }
}

async function initializeCheckoutPage() {
  await displayCheckoutItems()
  initializeCheckoutSteps()
}

function initializeAuthPage() {
  initializeAuthForms()
}

async function initializeDashboardPage() {
  const token = localStorage.getItem("token")
  if (!token) {
    window.location.href = "login.html"
    return
  }

  try {
    const user = await getUserProfile()
    const orders = await getOrders()
    const wishlist = await getWishlist()

    displayDashboardData(user, orders, wishlist)
  } catch (error) {
    console.error("Failed to load dashboard data:", error)
  }
}

function initializeContactPage() {
  const contactForm = document.getElementById("contact-form")
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = {
        name: document.getElementById("contact-name").value,
        email: document.getElementById("contact-email").value,
        subject: document.getElementById("contact-subject").value,
        message: document.getElementById("contact-message").value,
      }

      try {
        await submitContactForm(formData)
        this.reset()
      } catch (error) {
        console.error("Contact form submission failed:", error)
      }
    })
  }

  // Initialize FAQ accordion
  initializeFAQ()
}

// Additional helper functions for page initialization
function initializeHeroSlider() {
  const heroSlider = document.querySelector(".hero-slider")
  if (!heroSlider) return

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

  showSlide(0)
}

function initializeTestimonialSlider() {
  const testimonialsSlider = document.querySelector(".testimonials-slider")
  if (!testimonialsSlider) return

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

  setInterval(nextTestimonial, 7000)

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showTestimonial(index))
  })

  showTestimonial(0)
}

function initializeShopFilters(initialParams) {
  // Sort functionality
  const sortSelect = document.getElementById("sort-by")
  if (sortSelect) {
    sortSelect.addEventListener("change", async function () {
      const sortValue = this.value
      const sortParams = { ...initialParams }

      switch (sortValue) {
        case "price-low":
          sortParams.sort = "price"
          break
        case "price-high":
          sortParams.sort = "-price"
          break
        case "rating":
          sortParams.sort = "-rating"
          break
        case "newest":
          sortParams.sort = "-createdAt"
          break
      }

      showLoading("all-products")
      try {
        const sortedProducts = await getProducts(sortParams)
        await displayProducts(sortedProducts, "all-products")
      } catch (error) {
        console.error("Failed to sort products:", error)
      }
    })
  }

  // View toggle
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"))
      this.classList.add("active")

      const view = this.dataset.view
      const productsGrid = document.getElementById("all-products")
      productsGrid.className = view === "grid" ? "products-grid" : "products-list"
    })
  })

  // Price filter
  const applyPriceBtn = document.getElementById("apply-price")
  if (applyPriceBtn) {
    applyPriceBtn.addEventListener("click", async () => {
      const priceRange = document.getElementById("price-range").value
      const priceParams = { ...initialParams, maxPrice: priceRange }

      showLoading("all-products")
      try {
        const filteredProducts = await getProducts(priceParams)
        await displayProducts(filteredProducts, "all-products")
      } catch (error) {
        console.error("Failed to filter products:", error)
      }
    })
  }

  // Search functionality
  const searchForm = document.querySelector(".search-bar form")
  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      const query = document.getElementById("search-input").value

      if (query.trim()) {
        showLoading("all-products")
        try {
          const searchResults = await searchProducts(query)
          await displayProducts(searchResults, "all-products")
        } catch (error) {
          console.error("Search failed:", error)
        }
      }
    })
  }
}

function initializeAuthForms() {
  // Tab switching
  document.querySelectorAll(".auth-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabId = this.dataset.tab

      document.querySelectorAll(".auth-tabs .tab").forEach((t) => t.classList.remove("active"))
      this.classList.add("active")

      document.querySelectorAll(".auth-form").forEach((form) => form.classList.remove("active"))
      document.getElementById(`${tabId}-form`).classList.add("active")
    })
  })

  // Login form
  const loginForm = document.getElementById("login")
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      const email = document.getElementById("login-email").value
      const password = document.getElementById("login-password").value

      try {
        const result = await loginUser({ email, password })

        localStorage.setItem("token", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))

        // Merge guest cart with user cart
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
        if (guestCart.length > 0) {
          for (const item of guestCart) {
            await addToCart(item)
          }
          localStorage.removeItem("guestCart")
        }

        window.location.href = "dashboard.html"
      } catch (error) {
        console.error("Login failed:", error)
      }
    })
  }

  // Register form
  const registerForm = document.getElementById("register")
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      const firstName = document.getElementById("register-firstname").value
      const lastName = document.getElementById("register-lastname").value
      const email = document.getElementById("register-email").value
      const password = document.getElementById("register-password").value
      const confirm = document.getElementById("register-confirm").value

      if (password !== confirm) {
        showToast("Passwords do not match!", "error")
        return
      }

      try {
        const result = await registerUser({
          name: `${firstName} ${lastName}`,
          email,
          password,
        })

        localStorage.setItem("token", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))

        window.location.href = "dashboard.html"
      } catch (error) {
        console.error("Registration failed:", error)
      }
    })
  }

  // Forgot password form
  const forgotForm = document.getElementById("forgot")
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      const email = document.getElementById("forgot-email").value

      try {
        await forgotPassword(email)

        // Go back to login
        document.querySelectorAll(".auth-form").forEach((form) => form.classList.remove("active"))
        document.getElementById("login-form").classList.add("active")
        document.querySelector('.auth-tabs .tab[data-tab="login"]').classList.add("active")
        document.querySelector('.auth-tabs .tab[data-tab="register"]').classList.remove("active")
      } catch (error) {
        console.error("Forgot password failed:", error)
      }
    })
  }
}

function initializeFAQ() {
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", function () {
      const answer = this.nextElementSibling
      const icon = this.querySelector("i")

      // Toggle this item
      const isOpen = answer.style.maxHeight && answer.style.maxHeight !== "0px"

      // Close all items
      document.querySelectorAll(".faq-answer").forEach((a) => {
        a.style.maxHeight = "0px"
      })
      document.querySelectorAll(".faq-question i").forEach((i) => {
        i.classList.remove("fa-chevron-up")
        i.classList.add("fa-chevron-down")
      })

      // Open this item if it was closed
      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + "px"
        icon.classList.remove("fa-chevron-down")
        icon.classList.add("fa-chevron-up")
      }
    })
  })
}

// Apply coupon function
function applyCoupon(couponCode) {
  // This would typically validate the coupon with the backend
  const validCoupons = {
    DISCOUNT10: { type: "percentage", value: 10 },
    FREESHIP: { type: "shipping", value: 0 },
    SAVE20: { type: "percentage", value: 20 },
  }

  if (validCoupons[couponCode]) {
    const coupon = validCoupons[couponCode]
    showToast(
      `Coupon applied! ${coupon.type === "percentage" ? coupon.value + "% discount" : "Free shipping"}`,
      "success",
    )
    // Update totals based on coupon
    updateCartTotals()
  } else {
    showToast("Invalid coupon code", "error")
  }
}

// Logout function
function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  showToast("Logged out successfully", "success")
  window.location.href = "index.html"
}

// Add CSS for toast notifications and loading spinner
const additionalCSS = `
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10000;
  min-width: 300px;
  animation: slideIn 0.3s ease;
}

.toast-success { border-left: 4px solid #10b981; }
.toast-error { border-left: 4px solid #ef4444; }
.toast-info { border-left: 4px solid #3b82f6; }

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
}

.loading-spinner i {
  font-size: 2rem;
  margin-bottom: 16px;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.empty-cart, .no-products, .error {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 1.1rem;
}
`

// Add the CSS to the document
const styleSheet = document.createElement("style")
styleSheet.textContent = additionalCSS
document.head.appendChild(styleSheet)

// Helper functions for product page
function displayProductDetails(product) {
  const productDetailsContainer = document.getElementById("product-details")
  if (!productDetailsContainer) return

  productDetailsContainer.innerHTML = `
    <div class="product-image">
      <img src="${product.images?.[0] || "/placeholder.svg?height=400&width=400"}" alt="${product.name}">
    </div>
    <div class="product-info">
      <h2>${product.name}</h2>
      <div class="product-price">
        <span class="current-price">$${product.price?.toFixed(2)}</span>
        ${product.salePrice ? `<span class="old-price">$${product.salePrice.toFixed(2)}</span>` : ""}
      </div>
      <div class="product-rating">
        ${generateRatingStars(product.rating || 0)}
        <span>(${product.reviewCount || 0})</span>
      </div>
      <p class="product-description">${product.description}</p>
      <button class="btn btn-primary" onclick="handleAddToCart('${product._id || product.id}', '${product.name}', ${product.price})">
        Add to Cart
      </button>
    </div>
  `
}

function generateRatingStars(rating) {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5 ? 1 : 0
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

  return ratingStars
}

async function loadProductReviews(productId) {
  const reviewsContainer = document.getElementById("product-reviews")
  if (!reviewsContainer) return

  try {
    const reviews = await getProductReviews(productId)
    if (reviews.length === 0) {
      reviewsContainer.innerHTML = "<p>No reviews yet</p>"
      return
    }

    reviewsContainer.innerHTML = ""

    for (const review of reviews) {
      const reviewCard = document.createElement("div")
      reviewCard.className = "review-card"

      reviewCard.innerHTML = `
        <div class="review-header">
          <h4>${review.title}</h4>
          <div class="review-rating">
            ${generateRatingStars(review.rating)}
          </div>
        </div>
        <div class="review-body">
          <p>${review.comment}</p>
        </div>
        <div class="review-footer">
          <span>By ${review.user.name}</span>
          <span>${new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
      `

      reviewsContainer.appendChild(reviewCard)
    }
  } catch (error) {
    console.error("Failed to load product reviews:", error)
    reviewsContainer.innerHTML = '<p class="error">Failed to load reviews</p>'
  }
}

async function loadRelatedProducts(productId, category) {
  const relatedProductsContainer = document.getElementById("related-products")
  if (!relatedProductsContainer) return

  try {
    const relatedProducts = await getRelatedProducts(productId, category)
    if (relatedProducts.length === 0) {
      relatedProductsContainer.innerHTML = "<p>No related products</p>"
      return
    }

    relatedProductsContainer.innerHTML = ""

    for (const product of relatedProducts) {
      const productCard = document.createElement("div")
      productCard.className = "related-product-card"

      productCard.innerHTML = `
        <div class="related-product-image">
          <img src="${product.images?.[0] || "/placeholder.svg?height=200&width=200"}" alt="${product.name}">
        </div>
        <div class="related-product-details">
          <h4>${product.name}</h4>
          <div class="related-product-price">$${product.price?.toFixed(2)}</div>
        </div>
      `

      productCard.addEventListener("click", () => {
        window.location.href = `product.html?id=${product._id || product.id}`
      })

      relatedProductsContainer.appendChild(productCard)
    }
  } catch (error) {
    console.error("Failed to load related products:", error)
    relatedProductsContainer.innerHTML = '<p class="error">Failed to load related products</p>'
  }
}

// Helper functions for checkout page
async function displayCheckoutItems() {
  const container = document.getElementById("checkout-items")
  if (!container) return

  showLoading("checkout-items")

  try {
    const cartItems = await getCartItems()

    if (cartItems.length === 0) {
      container.innerHTML = '<p class="empty-cart">Your cart is empty</p>'
      return
    }

    container.innerHTML = ""

    for (const item of cartItems) {
      const product = await getProductById(item.productId)
      if (!product) continue

      const cartItem = document.createElement("div")
      cartItem.className = "checkout-item"
      cartItem.dataset.id = item.id || item._id

      cartItem.innerHTML = `
        <div class="item-product">
          <div class="item-image">
            <img src="${product.images?.[0] || "/placeholder.svg?height=80&width=80"}" alt="${product.name}">
          </div>
          <div class="item-details">
            <h4>${product.name}</h4>
            <p class="item-color">${item.color || "Default"}</p>
            <p class="item-size">${item.size || "Default"}</p>
          </div>
        </div>
        <div class="item-price">$${product.price?.toFixed(2)}</div>
        <div class="item-quantity">${item.quantity}</div>
        <div class="item-total">$${(product.price * item.quantity).toFixed(2)}</div>
      `

      container.appendChild(cartItem)
    }

    await updateCartTotals()
  } catch (error) {
    console.error("Failed to display checkout items:", error)
    container.innerHTML = '<p class="error">Failed to load checkout items</p>'
  }
}

function initializeCheckoutSteps() {
  // Implementation for checkout steps
  showToast("Checkout steps feature coming soon!", "info")
}

// Helper function for dashboard page
function displayDashboardData(user, orders, wishlist) {
  const dashboardContainer = document.getElementById("dashboard-container")
  if (!dashboardContainer) return

  dashboardContainer.innerHTML = `
    <div class="user-profile">
      <h2>Welcome, ${user.name}</h2>
      <p>Email: ${user.email}</p>
    </div>
    <div class="orders-section">
      <h3>Your Orders</h3>
      ${orders.length > 0 ? generateOrderList(orders) : "<p>No orders yet</p>"}
    </div>
    <div class="wishlist-section">
      <h3>Your Wishlist</h3>
      ${wishlist.length > 0 ? generateWishlistList(wishlist) : "<p>No items in wishlist</p>"}
    </div>
  `
}

function generateOrderList(orders) {
  let orderListHTML = "<ul>"
  orders.forEach((order) => {
    orderListHTML += `
      <li>
        <h4>Order #${order._id}</h4>
        <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p>Status: ${order.status}</p>
      </li>
    `
  })
  orderListHTML += "</ul>"
  return orderListHTML
}

function generateWishlistList(wishlist) {
  let wishlistListHTML = "<ul>"
  wishlist.forEach((item) => {
    wishlistListHTML += `
      <li>
        <h4>${item.name}</h4>
        <button onclick="removeFromWishlist('${item.productId}')">Remove</button>
      </li>
    `
  })
  wishlistListHTML += "</ul>"
  return wishlistListHTML
}
