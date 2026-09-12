import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { addToCart } from "../components/cartSlice"
import { products as localProducts } from "../data/products"
import axios from "axios"

import { getSmartProductImage } from "../utils/imageHelper"

function ProductDetails() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getProduct = async () => {
            setLoading(true)

            // 1. Check in local products list
            const foundLocal = localProducts.find(
                (p) => String(p._id || p.id) === String(id)
            )

            if (foundLocal) {
                setProduct(foundLocal)
                setLoading(false)
                return
            }

            // 2. Try fetching from backend API
            try {
                const response = await axios.get("http://localhost:3000/api/products")
                if (Array.isArray(response.data)) {
                    const foundBackend = response.data.find(
                        (p) => String(p._id || p.id) === String(id)
                    )
                    if (foundBackend) {
                        setProduct(foundBackend)
                        setLoading(false)
                        return
                    }
                }
            } catch (err) {
                console.warn("Could not fetch product from backend API:", err.message)
            }

            setProduct(null)
            setLoading(false)
        }

        getProduct()
    }, [id])

    if (loading) {
        return (
            <main className="p-10 text-center min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl font-semibold text-gray-700">Loading product details...</p>
            </main>
        )
    }

    if (!product) {
        return (
            <main className="p-10 text-center min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
                <p className="mt-2 text-gray-500">
                    The product you are looking for does not exist.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-5 rounded-md bg-[#febd69] px-6 py-2 font-bold text-black hover:bg-[#f3a847] transition cursor-pointer"
                >
                    Back to Home
                </button>
            </main>
        )
    }

    const title = product.title || product.name || "Product"
    const displayImage = getSmartProductImage(product)
    const productStock = product.stock !== undefined ? product.stock : 10
    const isOutOfStock = productStock <= 0

    const handleAddToCart = () => {
        dispatch(addToCart(product))
        alert("Product added to cart")
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

    return (
        <main className="bg-gray-100 min-h-screen p-5">
            <div className="mx-auto max-w-6xl bg-white p-8 rounded-lg shadow-md grid md:grid-cols-2 gap-10">

                {/* Product Image */}
                <div className="flex items-center justify-center">
                    <img
                        src={displayImage}
                        alt={title}
                        onError={(e) => {
                            e.target.onerror = null
                            e.target.src = getSmartProductImage({ ...product, image: "" })
                        }}
                        className="h-96 w-full object-contain"
                    />
                </div>

                {/* Product Information */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        {title}
                    </h1>

                    <div className="mt-3 flex items-center gap-3">
                        <div className="text-yellow-500">
                            ⭐⭐⭐⭐⭐
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded font-bold ${productStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {productStock > 0 ? `In Stock (${productStock} available)` : "Out of Stock"}
                        </span>
                    </div>

                    <p className="mt-5 text-3xl font-bold text-gray-900">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                    </p>

                    <p className="mt-5 text-gray-600 leading-7">
                        {product.description || "High quality product from ShopZone."}
                    </p>

                    <div className="mt-6 flex gap-4">

                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`px-6 py-3 rounded-full font-semibold shadow transition ${isOutOfStock ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#ffd814] hover:bg-[#f7ca00] cursor-pointer text-black"}`}
                        >
                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            disabled={isOutOfStock}
                            className={`px-6 py-3 rounded-full font-semibold shadow transition ${isOutOfStock ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"}`}
                        >
                            Buy Now
                        </button>

                    </div>
                </div>

            </div>
        </main>
    )
}

export default ProductDetails