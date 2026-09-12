import { createSlice } from "@reduxjs/toolkit"

const getCartKey = () => {
    try {
        const savedUser = localStorage.getItem("user")
        if (savedUser) {
            const user = JSON.parse(savedUser)
            if (user?.email) {
                return `cartItems_${user.email.trim().toLowerCase()}`
            }
        }
    } catch (e) {
        console.error("Error determining cart user key:", e)
    }
    return "cartItems_guest"
}

const loadCartFromStorage = () => {
    try {
        const key = getCartKey()
        const stored = localStorage.getItem(key)
        if (stored) return JSON.parse(stored)
        return []
    } catch {
        return []
    }
}

const saveCartToStorage = (items) => {
    try {
        const key = getCartKey()
        localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
        console.error("Failed to save cart to localStorage", e)
    }
}

const initialState = {
    items: loadCartFromStorage(),
}

const cartSlice = createSlice({
    name: "cart",
    initialState,

    reducers: {
        syncUserCart: (state) => {
            state.items = loadCartFromStorage()
        },

        addToCart: (state, action) => {
            const product = action.payload
            const productId = product._id || product.id

            const existingItem = state.items.find(
                (item) => (item._id || item.id) === productId
            )

            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1
            } else {
                state.items.push({
                    ...product,
                    quantity: 1,
                })
            }
            saveCartToStorage(state.items)
        },

        removeFromCart: (state, action) => {
            const targetId = action.payload
            state.items = state.items.filter(
                (item) => (item._id || item.id) !== targetId
            )
            saveCartToStorage(state.items)
        },

        clearCart: (state) => {
            state.items = []
            saveCartToStorage(state.items)
        },

        increaseQuantity: (state, action) => {
            const targetId = action.payload
            const item = state.items.find(
                (item) => (item._id || item.id) === targetId
            )

            if (item) {
                item.quantity = (item.quantity || 1) + 1
                saveCartToStorage(state.items)
            }
        },

        decreaseQuantity: (state, action) => {
            const targetId = action.payload
            const item = state.items.find(
                (item) => (item._id || item.id) === targetId
            )

            if (item) {
                if ((item.quantity || 1) > 1) {
                    item.quantity -= 1
                } else {
                    // If quantity is 1 and decrease is pressed, remove item
                    state.items = state.items.filter(
                        (i) => (i._id || i.id) !== targetId
                    )
                }
                saveCartToStorage(state.items)
            }
        },
    },
})

export const {
    syncUserCart,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
} = cartSlice.actions

export default cartSlice.reducer