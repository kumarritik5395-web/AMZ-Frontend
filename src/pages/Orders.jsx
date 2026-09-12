import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { getSmartProductImage } from "../utils/imageHelper"

const ORDER_STEPS = [
    { step: 1, label: "Ordered", desc: "Order placed & confirmed" },
    { step: 2, label: "Shipped", desc: "Packed & shipped" },
    { step: 3, label: "Out for Delivery", desc: "Courier partner en route" },
    { step: 4, label: "Delivered", desc: "Package delivered" },
]

function Orders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserOrders = async () => {
            const userStr = localStorage.getItem("user")
            if (!userStr) {
                setLoading(false)
                return
            }
            const user = JSON.parse(userStr)
            const userEmail = user?.email ? user.email.trim().toLowerCase() : ""
            const isUserAdmin = user && (user.role === "admin" || user.isAdmin === true || user.isAdminUser === true || userEmail === "ritik123@gmail.com" || userEmail.includes("admin"))

            // Try fetching real orders from backend if token exists
            if (user?.token) {
                try {
                    const response = await axios.get("http://localhost:3000/api/orders/myorders", {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    })
                    if (Array.isArray(response.data) && response.data.length > 0) {
                        const filtered = response.data.filter((ord) => {
                            if (isUserAdmin) return true // Admin sees ALL orders placed by any user
                            const ordEmail = (ord.userEmail || ord.user?.email || "").trim().toLowerCase()
                            return !ordEmail || ordEmail === userEmail
                        })
                        setOrders(filtered)
                        setLoading(false)
                        return
                    }
                } catch (err) {
                    console.warn("Backend orders fetch failed, falling back to local history:", err.message)
                }
            }

            // Fallback to local storage orders history
            try {
                const localOrders = JSON.parse(localStorage.getItem("ordersHistory") || "[]")
                
                // Admin sees ALL orders placed by any customer; Normal users see ONLY their own orders
                const userOrders = localOrders.filter((ord) => {
                    if (isUserAdmin) return true // Admin sees ALL orders
                    if (!userEmail) return false
                    const ordEmail = ord.userEmail ? ord.userEmail.trim().toLowerCase() : ""
                    return ordEmail === userEmail
                })
                setOrders(userOrders)
            } catch (e) {
                console.error("Error reading local orders history:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchUserOrders()
    }, [])

    const user = JSON.parse(localStorage.getItem("user") || "null")
    const isAdmin = user && (user.role === "admin" || user.isAdmin === true || user.isAdminUser === true || user.email?.toLowerCase() === "ritik123@gmail.com")

    if (!user) {
        return (
            <main className="min-h-screen bg-gray-100 p-5 flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                    <h1 className="text-2xl font-bold text-gray-800">Please Sign In</h1>
                    <p className="mt-2 text-gray-600">
                        You need to log in to view your returns and order history.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-5 w-full rounded-md bg-[#febd69] py-2 font-bold text-black hover:bg-[#f3a847] transition cursor-pointer"
                    >
                        Sign In Now
                    </button>
                </div>
            </main>
        )
    }

    const [returningItem, setReturningItem] = useState(null)
    const [returnReason, setReturnReason] = useState("Defective/Damaged product")

    // Helper to safely update an order in global localStorage history without deleting other users' orders
    const updateLocalStorageOrder = (orderId, updateFn) => {
        try {
            const allHistory = JSON.parse(localStorage.getItem("ordersHistory") || "[]")
            const updatedHistory = allHistory
                .map((order) => {
                    const oId = order._id || order.id
                    if (oId === orderId) {
                        return updateFn ? updateFn(order) : null // null means delete
                    }
                    return order
                })
                .filter(Boolean)
            localStorage.setItem("ordersHistory", JSON.stringify(updatedHistory))
        } catch (e) {
            console.error("Error updating localStorage ordersHistory:", e)
        }
    }

    // Remove Entire Order from History
    const handleRemoveOrder = (orderId) => {
        if (!window.confirm("Are you sure you want to remove this order from history?")) return

        updateLocalStorageOrder(orderId, null) // remove from localStorage
        setOrders((prev) => prev.filter((order) => (order._id || order.id) !== orderId))
    }

    // Remove Single Product Item from an Order
    const handleRemoveItem = (orderId, itemIndex) => {
        if (!window.confirm("Remove this product from this order record?")) return

        updateLocalStorageOrder(orderId, (order) => {
            const currentItems = order.orderItems || order.items || []
            const newItems = currentItems.filter((_, idx) => idx !== itemIndex)
            if (newItems.length === 0) return null
            const newTotal = newItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0)
            return { ...order, orderItems: newItems, totalAmount: newTotal }
        })

        setOrders((prev) =>
            prev
                .map((order) => {
                    const oId = order._id || order.id
                    if (oId === orderId) {
                        const currentItems = order.orderItems || order.items || []
                        const newItems = currentItems.filter((_, idx) => idx !== itemIndex)
                        if (newItems.length === 0) return null
                        const newTotal = newItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0)
                        return { ...order, orderItems: newItems, totalAmount: newTotal }
                    }
                    return order
                })
                .filter(Boolean)
        )
    }

    // Handle Order Cancellation
    const handleCancelOrder = (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return

        updateLocalStorageOrder(orderId, (order) => ({
            ...order,
            status: "Cancelled",
            currentStep: 0,
        }))

        setOrders((prev) =>
            prev.map((order) => {
                const oId = order._id || order.id
                if (oId === orderId) {
                    return { ...order, status: "Cancelled", currentStep: 0 }
                }
                return order
            })
        )
    }

    // Advance order step (Simulation)
    const handleAdvanceStep = (orderId) => {
        let updatedNextStep = 1
        let updatedNextStatus = "Ordered"

        updateLocalStorageOrder(orderId, (order) => {
            if (order.status !== "Cancelled" && order.status !== "Returned") {
                const nextStep = Math.min((order.currentStep || 1) + 1, 4)
                const nextStatus = ORDER_STEPS.find((s) => s.step === nextStep)?.label || "Delivered"
                updatedNextStep = nextStep
                updatedNextStatus = nextStatus
                return { ...order, currentStep: nextStep, status: nextStatus }
            }
            return order
        })

        setOrders((prev) =>
            prev.map((order) => {
                const oId = order._id || order.id
                if (oId === orderId && order.status !== "Cancelled" && order.status !== "Returned") {
                    const nextStep = Math.min((order.currentStep || 1) + 1, 4)
                    const nextStatus = ORDER_STEPS.find((s) => s.step === nextStep)?.label || "Delivered"
                    return { ...order, currentStep: nextStep, status: nextStatus }
                }
                return order
            })
        )
    }

    const handleInitiateReturn = (orderId, item) => {
        setReturningItem({ orderId, item })
    }

    const handleConfirmReturn = () => {
        if (!returningItem) return

        updateLocalStorageOrder(returningItem.orderId, (order) => {
            const updatedItems = (order.orderItems || order.items || []).map((item) => {
                if ((item._id || item.id || item.title) === (returningItem.item._id || returningItem.item.id || returningItem.item.title)) {
                    return { ...item, isReturned: true, returnReason }
                }
                return item
            })
            return { ...order, status: "Returned", orderItems: updatedItems }
        })

        setOrders((prev) =>
            prev.map((order) => {
                const orderId = order._id || order.id
                if (orderId === returningItem.orderId) {
                    const updatedItems = (order.orderItems || order.items || []).map((item) => {
                        if ((item._id || item.id || item.title) === (returningItem.item._id || returningItem.item.id || returningItem.item.title)) {
                            return { ...item, isReturned: true, returnReason }
                        }
                        return item
                    })
                    return { ...order, status: "Returned", orderItems: updatedItems }
                }
                return order
            })
        )

        setReturningItem(null)
    }

    return (
        <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Your Orders & Tracking 📦
                </h1>

                {loading ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                        <p className="text-lg font-semibold text-gray-600">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                        <p className="text-xl font-semibold text-gray-700">No orders placed yet.</p>
                        <p className="mt-2 text-gray-500">Looks like you haven't bought anything yet.</p>
                        <Link
                            to="/"
                            className="mt-5 inline-block rounded-md bg-[#febd69] px-6 py-2.5 font-bold text-black hover:bg-[#f3a847] transition"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => {
                            const orderId = order._id || order.id || `ORD-${index + 1001}`
                            const createdAt = order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                  })
                                : new Date().toLocaleDateString("en-IN")

                            const items = order.orderItems || order.items || []
                            const currentStep = order.currentStep || (order.status === "Delivered" ? 4 : order.status === "Cancelled" || order.status === "Returned" ? 0 : 1)
                            const isCancelled = order.status === "Cancelled"
                            const isReturned = order.status === "Returned"
                            const isDelivered = order.status === "Delivered" || currentStep === 4

                            return (
                                <div
                                    key={orderId}
                                    className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                                >
                                    {/* Order Header */}
                                    <div className="bg-gray-100 p-4 border-b flex flex-wrap justify-between items-center text-sm text-gray-600 gap-4">
                                        <div>
                                            <p className="font-semibold uppercase text-xs text-gray-500">Order Placed</p>
                                            <p className="font-medium text-gray-800">{createdAt}</p>
                                        </div>

                                        <div>
                                            <p className="font-semibold uppercase text-xs text-gray-500">Total Amount</p>
                                            <p className="font-bold text-gray-900">
                                                ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="font-semibold uppercase text-xs text-gray-500">Status</p>
                                            {isCancelled ? (
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                    Cancelled
                                                </span>
                                            ) : isReturned ? (
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                                                    Returned
                                                </span>
                                            ) : isDelivered ? (
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                    Delivered
                                                </span>
                                            ) : (
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                    {order.status || "In Progress"}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {isAdmin && order.userEmail && (
                                                <div>
                                                    <p className="font-semibold uppercase text-xs text-gray-500">Customer Email</p>
                                                    <p className="font-medium text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                                        {order.userEmail}
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <p className="font-semibold uppercase text-xs text-gray-500">Order ID</p>
                                                <p className="font-mono text-xs text-gray-700">#{orderId}</p>
                                            </div>

                                            {/* Admin Only Delete Order option */}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleRemoveOrder(orderId)}
                                                    className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer bg-red-50 px-2 py-1 rounded border border-red-200"
                                                    title="Admin: Remove order from history"
                                                >
                                                    🗑️ Admin Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 4-Step Order Tracker Progress Bar */}
                                    {!isCancelled && !isReturned && (
                                        <div className="p-5 border-b bg-gray-50/50">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                                                    Delivery Tracking Progress
                                                </h4>
                                                {isAdmin && !isDelivered && (
                                                    <button
                                                        onClick={() => handleAdvanceStep(orderId)}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded"
                                                    >
                                                        Admin: Simulate Next Step ➔
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-4 gap-2 relative">
                                                {ORDER_STEPS.map((s) => {
                                                    const isCompleted = currentStep >= s.step
                                                    const isCurrent = currentStep === s.step

                                                    return (
                                                        <div key={s.step} className="flex flex-col items-center text-center">
                                                            {/* Step indicator circle */}
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                                                                    isCompleted
                                                                        ? "bg-green-600 text-white"
                                                                        : "bg-gray-200 text-gray-500"
                                                                } ${isCurrent ? "ring-4 ring-green-200" : ""}`}
                                                            >
                                                                {isCompleted ? "✓" : s.step}
                                                            </div>
                                                            {/* Step Label */}
                                                            <p
                                                                className={`mt-2 text-xs font-bold ${
                                                                    isCompleted ? "text-gray-900" : "text-gray-400"
                                                                }`}
                                                            >
                                                                {s.label}
                                                            </p>
                                                            <p className="hidden sm:block text-[11px] text-gray-400 mt-0.5">
                                                                {s.desc}
                                                            </p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Items */}
                                    <div className="p-5 divide-y">
                                        {items.map((item, idx) => {
                                            const itemTitle = item.title || item.name || "Product"
                                            const itemImg = getSmartProductImage(item)
                                            const itemReturned = item.isReturned

                                            return (
                                                <div
                                                    key={idx}
                                                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center gap-5"
                                                >
                                                    <img
                                                        src={itemImg}
                                                        alt={itemTitle}
                                                        className="h-24 w-24 object-contain rounded"
                                                        onError={(e) => {
                                                            e.target.onerror = null
                                                            e.target.src = getSmartProductImage({ ...item, image: "" })
                                                        }}
                                                    />

                                                    <div className="flex-1 text-center sm:text-left">
                                                        <h3 className="font-bold text-lg text-gray-900">{itemTitle}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity || 1}</p>
                                                        <p className="text-base font-bold text-gray-900 mt-1">
                                                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                                        </p>
                                                        {itemReturned && (
                                                            <p className="text-xs text-orange-600 font-semibold mt-1 bg-orange-50 inline-block px-2 py-0.5 rounded">
                                                                Return Status: Initiated ({item.returnReason || "Returned"})
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        {/* Cancel Order Option (if not delivered/cancelled/returned) */}
                                                        {!isDelivered && !isCancelled && !isReturned && (
                                                            <button
                                                                onClick={() => handleCancelOrder(orderId)}
                                                                className="rounded-full border border-red-300 bg-red-50 text-red-700 px-4 py-1.5 text-xs font-bold hover:bg-red-100 transition cursor-pointer"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        )}

                                                        {/* Return Item Option (if delivered and not already returned) */}
                                                        {isDelivered && !itemReturned && !isCancelled && (
                                                            <button
                                                                onClick={() => handleInitiateReturn(orderId, item)}
                                                                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-800 hover:bg-gray-100 shadow-sm transition cursor-pointer"
                                                            >
                                                                Return Item
                                                            </button>
                                                        )}

                                                        {itemReturned && (
                                                            <span className="rounded-full bg-orange-100 text-orange-700 px-4 py-1.5 text-xs font-bold text-center">
                                                                Returned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Return Modal */}
            {returningItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900">Return Item</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Item: <span className="font-semibold text-gray-800">{returningItem.item.title || returningItem.item.name}</span>
                        </p>

                        <label className="block text-sm font-semibold text-gray-700 mt-4 mb-2">
                            Select Reason for Return:
                        </label>
                        <select
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-full border rounded p-2.5 text-sm bg-gray-50 outline-none"
                        >
                            <option value="Defective/Damaged product">Defective or Damaged product</option>
                            <option value="Wrong item received">Wrong item received</option>
                            <option value="Quality not as expected">Quality not as expected</option>
                            <option value="No longer needed">No longer needed</option>
                        </select>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setReturningItem(null)}
                                className="px-4 py-2 rounded text-sm font-semibold text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReturn}
                                className="px-5 py-2 rounded bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 shadow"
                            >
                                Confirm Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Orders
