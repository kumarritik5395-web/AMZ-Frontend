import axios from "axios"

const API_BASE_URL = "http://localhost:3000/api"

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Automatically attach user token to requests if available
api.interceptors.request.use(
    (config) => {
        try {
            const savedUser = localStorage.getItem("user")
            if (savedUser) {
                const user = JSON.parse(savedUser)
                if (user?.token) {
                    config.headers.Authorization = `Bearer ${user.token}`
                }
            }
        } catch (e) {
            console.error("Error setting Auth header:", e)
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Create Order API
export const createOrder = async (orderData) => {
    try {
        const response = await api.post("/orders", orderData)
        console.log("Order created in MongoDB backend:", response.data)
        return response.data
    } catch (error) {
        console.error("Backend createOrder Error:", error.response?.data || error.message)
        throw error
    }
}

// Update Order Payment Status API
export const updateOrderToPaid = async (orderId, paymentData = {}) => {
    try {
        const response = await api.put(`/orders/${orderId}/pay`, paymentData)
        console.log("Order payment status updated in MongoDB backend:", response.data)
        return response.data
    } catch (error) {
        console.error("Backend updateOrderToPaid Error:", error.response?.data || error.message)
        throw error
    }
}

// Fetch Products API
export const fetchProducts = async () => {
    try {
        const response = await api.get("/products")
        return response.data
    } catch (error) {
        console.warn("Backend fetchProducts failed/offline:", error.message)
        return null
    }
}

// Create Product API (MongoDB)
export const createProduct = async (productData) => {
    try {
        const response = await api.post("/products", productData)
        console.log("Product created in MongoDB:", response.data)
        return response.data
    } catch (error) {
        console.error("Backend createProduct Error:", error.response?.data || error.message)
        throw error
    }
}

// Update Product API (MongoDB)
export const updateProduct = async (productId, productData) => {
    try {
        const response = await api.put(`/products/${productId}`, productData)
        console.log("Product updated in MongoDB:", response.data)
        return response.data
    } catch (error) {
        console.error("Backend updateProduct Error:", error.response?.data || error.message)
        throw error
    }
}

// Delete Product API (MongoDB)
export const deleteProduct = async (productId) => {
    try {
        const response = await api.delete(`/products/${productId}`)
        console.log("Product deleted from MongoDB:", response.data)
        return response.data
    } catch (error) {
        console.error("Backend deleteProduct Error:", error.response?.data || error.message)
        throw error
    }
}

// Add to Cart API (MongoDB)
export const addToCartAPI = async (cartData) => {
    try {
        const response = await api.post("/cart/add", cartData)
        console.log("Cart item synced to MongoDB backend:", response.data)
        return response.data
    } catch (error) {
        console.warn("Backend addToCart failed/offline:", error.message)
        return null
    }
}

export default api
