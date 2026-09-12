import { createSlice } from "@reduxjs/toolkit"

const loadWishlistFromStorage = () => {
    try {
        const stored = localStorage.getItem("wishlistItems")
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

const saveWishlistToStorage = (items) => {
    try {
        localStorage.setItem("wishlistItems", JSON.stringify(items))
    } catch (e) {
        console.error("Failed to save wishlist to localStorage", e)
    }
}

const initialState = {
    items: loadWishlistFromStorage(),
}

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,

    reducers: {
        toggleWishlist: (state, action) => {
            const product = action.payload
            const existsIndex = state.items.findIndex((item) => item.id === product.id)
            if (existsIndex >= 0) {
                state.items.splice(existsIndex, 1)
            } else {
                state.items.push(product)
            }
            saveWishlistToStorage(state.items)
        },

        removeFromWishlist: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload)
            saveWishlistToStorage(state.items)
        },

        clearWishlist: (state) => {
            state.items = []
            saveWishlistToStorage(state.items)
        },
    },
})

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer
