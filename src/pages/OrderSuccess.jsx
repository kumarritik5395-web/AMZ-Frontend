import { useLocation, useNavigate } from "react-router-dom"

function OrderSuccess() {
    const location = useLocation()
    const navigate = useNavigate()

    const name = location.state?.name || "Customer"
    const totalPrice = location.state?.totalPrice || 0

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-5">

            <div className="w-full max-w-2xl rounded-lg bg-white p-10 text-center shadow-md">

                <div className="text-6xl">
                    ✅
                </div>

                <h1 className="mt-5 text-3xl font-bold text-green-600">
                    Order Placed Successfully!
                </h1>

                <p className="mt-4 text-lg">
                    Thank you, <span className="font-bold">{name}</span>!
                </p>

                <p className="mt-2 text-gray-600">
                    Your order has been placed successfully.
                </p>

                <div className="mt-6 rounded bg-gray-100 p-5">
                    <p className="text-gray-600">
                        Order Amount
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-800">
                        ₹{totalPrice.toLocaleString("en-IN")}
                    </p>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="mt-6 rounded bg-yellow-400 px-6 py-3 font-bold hover:bg-yellow-500 transition"
                >
                    Continue Shopping
                </button>

            </div>

        </main>
    )
}

export default OrderSuccess
