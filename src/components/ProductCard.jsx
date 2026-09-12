import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { addToCart } from "./cartSlice"
import axios from "axios"

import electronicsImg from "../assets/electronics.jpg"
import fashionImg from "../assets/fashion.jpg"
import booksImg from "../assets/Books.jpg"
import paymentsImg from "../assets/payments.jpg"

import { getSmartProductImage } from "../utils/imageHelper"

function ProductCard({ product }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const productId = product._id || product.id
    const productTitle = product.title || product.name || "Product"
    const displayImage = getSmartProductImage(product)

    const handleAddToCart = async (showAlert = true) => {
        try {
            // Redux cart me add
            dispatch(addToCart(product))

            // Check user login status
            const user = JSON.parse(localStorage.getItem("user"))

            if (!user) {
                if (showAlert) alert("Please login first")
                return false
            }

            // Backend cart me add (if backend is available)
            if (user?.token) {
                try {
                    await axios.post(
                        "http://localhost:3000/api/cart/add",
                        {
                            productId: productId,
                            quantity: 1,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${user.token}`,
                            },
                        }
                    )
                } catch (err) {
                    console.warn("Backend sync failed:", err.message)
                }
            }

            if (showAlert) alert("Product added to cart")
            return true
        } catch (error) {
            console.error(
                "Add to cart error:",
                error.response?.data || error.message
            )
            return false
        }
    }

    const handleBuyNow = () => {
        const user = JSON.parse(localStorage.getItem("user"))
        if (!user) {
            alert("Please login first to proceed to checkout")
            navigate("/login")
            return
        }
        navigate("/checkout", { state: { buyNowProduct: product } })
    }

    const productStock = product.stock !== undefined ? product.stock : 10
    const isOutOfStock = productStock <= 0

    return (
        <div className="bg-white p-4 shadow-md transition hover:shadow-lg rounded-lg flex flex-col justify-between group">

            <Link to={`/product/${productId}`} className="block flex-1">

                <img
                    src={displayImage}
                    alt={productTitle}
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src = getSmartProductImage({ ...product, image: "" })
                    }}
                    className="h-48 w-full object-contain"
                />

                <h2 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-amber-600 transition line-clamp-2">
                    {productTitle}
                </h2>

                <div className="mt-2 flex items-center justify-between">
                    <p className="text-xl font-bold text-gray-900">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                    </p>

                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${!isOutOfStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {!isOutOfStock ? `In Stock (${productStock})` : "Out of Stock"}
                    </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                    {product.category}
                </p>

            </Link>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 rounded-full py-2 font-semibold transition text-sm ${isOutOfStock ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#ffd814] hover:bg-[#f7ca00] cursor-pointer"}`}
                >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`flex-1 rounded-full py-2 font-semibold transition text-sm ${isOutOfStock ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#ffa41c] hover:bg-[#fa8900] text-black cursor-pointer"}`}
                >
                    Buy Now
                </button>
            </div>
        </div>
    )
}

export default ProductCard