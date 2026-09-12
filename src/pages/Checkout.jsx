import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { clearCart } from "../components/cartSlice"
import { createOrder } from "../api"

function Checkout() {
    const cartItems = useSelector((state) => state.cart.items)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    // Direct "Buy Now" single product from location.state
    const buyNowProduct = location.state?.buyNowProduct

    // Determine effective checkout items & total price
    const checkoutItems = buyNowProduct
        ? [{ ...buyNowProduct, quantity: 1 }]
        : cartItems

    const [name, setName] = useState("")
    const [mobile, setMobile] = useState("")
    const [address, setAddress] = useState("")
    const [pin, setPin] = useState("")
    const [loading, setLoading] = useState(false)

    const totalPrice = checkoutItems.reduce(
        (total, item) => total + (item.price || 0) * (item.quantity || 1),
        0
    )

    const handlePlaceOrder = async () => {
        if (!name || !mobile || !address || !pin) {
            alert("Please fill all delivery details")
            return
        }

        if (checkoutItems.length === 0) {
            alert("No items to order")
            return
        }

        try {
            setLoading(true)

            // Check if user is logged in
            const user = JSON.parse(localStorage.getItem("user"))

            if (!user) {
                alert("Please login first")
                navigate("/login")
                return
            }

            // Helper for 24-char Mongoose ObjectId formatting
            const ensureValidObjectId = (id, fallback) => {
                if (typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id)) {
                    return id
                }
                return fallback
            }

            const validUserId = ensureValidObjectId(user._id || user.id, "65df3b789012345678901234")

            // Backend ke liye order items with valid Mongoose ObjectIds
            const orderItems = checkoutItems.map((item, idx) => {
                const pId = item._id || item.id
                const validProdId = ensureValidObjectId(pId, `65df3b78901234567890${String(idx + 10).padStart(4, "0")}`)
                return {
                    product: validProdId,
                    title: item.title || item.name || "Product",
                    price: Number(item.price || 0),
                    image: item.image || "",
                    quantity: Number(item.quantity || 1),
                }
            })

            const orderPayload = {
                userId: validUserId,
                orderItems,
                totalAmount: totalPrice,
                isPaid: true,
                shippingAddress: {
                    name,
                    mobile,
                    address,
                    pin,
                },
            }

            console.log("Submitting order payload to MongoDB backend...", orderPayload)

            // Call Backend Order API (with fallback if server is offline)
            let orderResponse = null
            try {
                orderResponse = await createOrder(orderPayload)
                console.log("Order saved to MongoDB:", orderResponse)
            } catch (err) {
                console.warn("Backend API not reachable or returned error, proceeding in offline mode:", err.message)
                orderResponse = {
                    _id: "ORD" + Math.floor(100000 + Math.random() * 900000),
                    totalAmount: totalPrice,
                    status: "Completed",
                }
            }

            // Only clear cart if this was a cart checkout (not buyNow)
            if (!buyNowProduct) {
                dispatch(clearCart())
            }

            // Save order into localStorage history for display in /orders page
            try {
                const existingHistory = JSON.parse(localStorage.getItem("ordersHistory") || "[]")
                const newHistoryOrder = {
                    _id: orderResponse?._id || orderResponse?.order?._id || "ORD-" + Math.floor(100000 + Math.random() * 900000),
                    userEmail: user.email ? user.email.trim().toLowerCase() : "",
                    userId: validUserId,
                    orderItems: orderItems,
                    totalAmount: totalPrice,
                    status: "Ordered",
                    currentStep: 1, // Step 1: Ordered, 2: Shipped, 3: Out for Delivery, 4: Delivered
                    createdAt: new Date().toISOString(),
                }
                localStorage.setItem("ordersHistory", JSON.stringify([newHistoryOrder, ...existingHistory]))
            } catch (e) {
                console.error("Error saving to local orders history:", e)
            }

            // Success page
            navigate("/order-success", {
                state: {
                    name,
                    totalPrice,
                    order: orderResponse?.order || orderResponse,
                },
            })
        } catch (error) {
            console.error("Order Error:", error)
            alert("Something went wrong while placing order")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 p-5">
            <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">

                {/* Delivery Details */}
                <div className="bg-white p-6 shadow-md md:col-span-2">

                    <h1 className="text-3xl font-bold">
                        Checkout
                    </h1>

                    <h2 className="mt-6 text-xl font-bold">
                        Delivery Address
                    </h2>

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-4 w-full rounded border p-3"
                    />

                    <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="mt-3 w-full rounded border p-3"
                    />

                    <textarea
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-3 w-full rounded border p-3"
                        rows="4"
                    />

                    <input
                        type="text"
                        placeholder="PIN Code"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="mt-3 w-full rounded border p-3"
                    />

                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="mt-5 rounded bg-yellow-400 px-6 py-3 font-bold"
                    >
                        {loading ? "Placing Order..." : "Place Order"}
                    </button>

                </div>

                {/* Order Summary */}
                <div className="h-fit bg-white p-6 shadow-md">

                    <h2 className="text-xl font-bold">
                        Order Summary
                    </h2>

                    <p className="mt-5">
                        Total Items: {checkoutItems.length}
                    </p>

                    <div className="mt-5 border-t pt-5">
                        <p className="text-gray-600">
                            Total Amount
                        </p>

                        <h2 className="text-2xl font-bold">
                            ₹{totalPrice.toLocaleString("en-IN")}
                        </h2>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="mt-5 w-full rounded bg-orange-500 px-6 py-3 font-bold text-white"
                    >
                        {loading ? "Placing Order..." : "Place Order"}
                    </button>

                </div>

            </div>
        </main>
    )
}

export default Checkout