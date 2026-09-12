import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import {
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    syncUserCart,
} from "../components/cartSlice"

import { getSmartProductImage } from "../utils/imageHelper"

function Cart() {
    const cartItems = useSelector((state) => state.cart.items)
    const dispatch = useDispatch()
    const [cartTrigger, setCartTrigger] = useState(0)

    const user = JSON.parse(localStorage.getItem("user") || "null")
    const isAdmin = user && (user.role === "admin" || user.isAdmin === true || user.isAdminUser === true || user.email?.toLowerCase() === "ritik123@gmail.com" || user.email?.toLowerCase().includes("admin"))

    const totalPrice = cartItems.reduce(
        (total, item) => total + (item.price || 0) * (item.quantity || 1),
        0
    )

    // Admin utility to scan all customer carts saved in localStorage
    const getAllCustomerCarts = () => {
        const customerCarts = []
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith("cartItems_")) {
                    const email = key.replace("cartItems_", "")
                    const items = JSON.parse(localStorage.getItem(key) || "[]")
                    if (Array.isArray(items) && items.length > 0) {
                        customerCarts.push({
                            email: email === "guest" ? "Guest User" : email,
                            rawKey: key,
                            items,
                            totalPrice: items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0),
                        })
                    }
                }
            }
        } catch (e) {
            console.error("Error loading customer carts:", e)
        }
        return customerCarts
    }

    const allCustomerCarts = isAdmin ? getAllCustomerCarts() : []

    // Admin: Remove specific item from a customer's cart
    const handleAdminRemoveCartItem = (rawKey, userEmail, targetItemId) => {
        if (!window.confirm(`Admin: Remove this product from ${userEmail}'s cart?`)) return

        try {
            const existingItems = JSON.parse(localStorage.getItem(rawKey) || "[]")
            const updatedItems = existingItems.filter(
                (item) => String(item._id || item.id) !== String(targetItemId)
            )

            if (updatedItems.length > 0) {
                localStorage.setItem(rawKey, JSON.stringify(updatedItems))
            } else {
                localStorage.removeItem(rawKey)
            }

            // Sync current Redux cart if admin deleted from their own cart
            const currentEmail = user?.email ? user.email.trim().toLowerCase() : ""
            if (currentEmail && rawKey === `cartItems_${currentEmail}`) {
                dispatch(syncUserCart())
            }

            setCartTrigger((prev) => prev + 1)
        } catch (e) {
            console.error("Admin remove item error:", e)
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 p-5 space-y-6">
            <div className="mx-auto max-w-6xl bg-white p-6 shadow-md rounded-md">

                <h1 className="text-3xl font-bold border-b pb-4">
                    Shopping Cart 🛒
                </h1>

                {cartItems.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-xl text-gray-600">
                            Your cart is currently empty.
                        </p>
                        <Link
                            to="/"
                            className="mt-4 inline-block rounded bg-[#febd69] px-6 py-2 font-bold text-black hover:bg-[#f3a847]"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6">

                        {cartItems.map((item, idx) => {
                            const itemId = item._id || item.id
                            const itemTitle = item.title || item.name || "Product"
                            const displayImage = getSmartProductImage(item)

                            return (
                                <div
                                    key={itemId || idx}
                                    className="flex flex-col sm:flex-row items-center gap-5 border-b p-5"
                                >

                                    {/* Product Image */}
                                    <img
                                        src={displayImage}
                                        alt={itemTitle}
                                        onError={(e) => {
                                            e.target.onerror = null
                                            e.target.src = getSmartProductImage({ ...item, image: "" })
                                        }}
                                        className="h-28 w-28 object-contain"
                                    />

                                    {/* Product Details */}
                                    <div className="flex-1 text-center sm:text-left">

                                        <h2 className="text-xl font-bold">
                                            {itemTitle}
                                        </h2>

                                        <p className="mt-2 text-xl font-bold text-gray-800">
                                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="mt-3 flex items-center justify-center sm:justify-start gap-3">
                                            <span className="text-sm font-semibold text-gray-600">Qty:</span>

                                            <button
                                                onClick={() =>
                                                    dispatch(
                                                        decreaseQuantity(itemId)
                                                    )
                                                }
                                                className="rounded border px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold"
                                            >
                                                −
                                            </button>

                                            <span className="font-bold text-lg px-2">
                                                {item.quantity}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    dispatch(
                                                        increaseQuantity(itemId)
                                                    )
                                                }
                                                className="rounded border px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold"
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() =>
                                            dispatch(removeFromCart(itemId))
                                        }
                                        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 font-semibold"
                                    >
                                        Remove
                                    </button>

                                </div>
                            )
                        })}

                        {/* Cart Bottom */}
                        <div className="mt-6 pt-5">

                            <div className="flex items-center justify-between">

                                <button
                                    onClick={() => dispatch(clearCart())}
                                    className="rounded bg-gray-800 px-5 py-2 text-white hover:bg-gray-900 font-semibold"
                                >
                                    Clear Cart
                                </button>

                                <div className="text-right">
                                    <p className="text-gray-600 font-medium">
                                        Total Price
                                    </p>

                                    <h2 className="text-2xl font-bold text-gray-900">
                                        ₹{totalPrice.toLocaleString("en-IN")}
                                    </h2>
                                </div>

                            </div>

                            {/* Proceed to Buy */}
                            <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                <Link
                                    to="/"
                                    className="flex-1 text-center rounded border border-gray-300 bg-gray-50 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-100 transition"
                                >
                                    Continue Shopping
                                </Link>
                                <Link
                                    to="/checkout"
                                    className="flex-1 text-center rounded bg-[#ffd814] px-6 py-3 font-bold text-black hover:bg-[#f7ca00] transition shadow"
                                >
                                    Proceed to Buy ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                                </Link>
                            </div>

                        </div>

                    </div>
                )}

            </div>

            {/* Admin Only: All Customers Carts Section */}
            {isAdmin && (
                <div className="mx-auto max-w-6xl bg-white p-6 shadow-md rounded-md border-2 border-amber-400">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                                ⚙️ Customer Carts Overview <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded font-bold">Admin Only</span>
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Real-time view of all products added to cart by registered customer emails. Admin can delete products from any cart.
                            </p>
                        </div>
                        <span className="text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-full text-gray-700">
                            Active Carts: {allCustomerCarts.length}
                        </span>
                    </div>

                    {allCustomerCarts.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">
                            No customers currently have items in their cart.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {allCustomerCarts.map((cCart, cIdx) => (
                                <div key={cIdx} className="border rounded-lg overflow-hidden bg-gray-50">
                                    <div className="bg-amber-100 px-4 py-2.5 border-b flex justify-between items-center text-sm gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-gray-800">👤 User Email:</span>
                                            <span className="font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 text-xs">
                                                {cCart.email}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900 text-xs">
                                                Cart Total: ₹{cCart.totalPrice.toLocaleString("en-IN")} ({cCart.items.length} items)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 divide-y bg-white">
                                        {cCart.items.map((cItem, iIdx) => {
                                            const cImg = getSmartProductImage(cItem)
                                            const cItemId = cItem._id || cItem.id

                                            return (
                                                <div key={iIdx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                                                    <img
                                                        src={cImg}
                                                        alt={cItem.title || cItem.name}
                                                        className="h-14 w-14 object-contain rounded border p-1"
                                                        onError={(e) => {
                                                            e.target.onerror = null
                                                            e.target.src = getSmartProductImage({ ...cItem, image: "" })
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-gray-900 truncate">
                                                            {cItem.title || cItem.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Quantity: <span className="font-semibold text-gray-800">{cItem.quantity || 1}</span>
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-sm text-gray-900">
                                                        ₹{Number(cItem.price || 0).toLocaleString("en-IN")}
                                                    </p>

                                                    {/* Admin Delete Single Product from Customer Cart */}
                                                    <button
                                                        onClick={() => handleAdminRemoveCartItem(cCart.rawKey, cCart.email, cItemId)}
                                                        className="rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                                                        title="Admin: Remove this product from customer cart"
                                                    >
                                                        🗑️ Admin Delete
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </main>
    )
}

export default Cart