import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"

import electronicsImg from "../assets/electronics.jpg"
import fashionImg from "../assets/fashion.jpg"
import booksImg from "../assets/Books.jpg"
import paymentsImg from "../assets/payments.jpg"
import bannerImg from "../assets/hero.png"

import { products as defaultProducts } from "../data/products"
import ProductCard from "../components/ProductCard"

const categories = [
    {
        title: "Electronics",
        image: electronicsImg,
    },
    {
        title: "Fashion",
        image: fashionImg,
    },
    {
        title: "Books",
        image: booksImg,
    },
    {
        title: "Amazon Pay & Billing",
        image: paymentsImg,
    },
]

function Home() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const searchQuery = searchParams.get("search") || ""

    // Backend & Local Storage se products fetch
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3000/api/products"
                )

                if (Array.isArray(response.data) && response.data.length > 0) {
                    setProducts(response.data)
                    setLoading(false)
                    return
                }
            } catch (error) {
                console.warn("Backend fetch failed, checking local storage / defaults:", error.message)
            }

            // Check local custom products if backend fails or returns empty
            const savedCustom = localStorage.getItem("custom_products")
            if (savedCustom) {
                try {
                    const parsed = JSON.parse(savedCustom)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setProducts(parsed)
                        setLoading(false)
                        return
                    }
                } catch (e) {
                    console.error("Local custom products parse error:", e)
                }
            }

            setProducts(defaultProducts)
            setLoading(false)
        }

        fetchProducts()
    }, [])

    const filteredProducts = products.filter((product) => {
        const q = searchQuery.toLowerCase().trim()

        if (!q) return true

        return (
            (product.title &&
                product.title.toLowerCase().includes(q)) ||
            (product.name &&
                product.name.toLowerCase().includes(q)) ||
            (product.category &&
                product.category.toLowerCase().includes(q)) ||
            (product.description &&
                product.description.toLowerCase().includes(q))
        )
    })

    const handleCategoryClick = (categoryTitle) => {
        navigate(`/?search=${encodeURIComponent(categoryTitle)}`)
    }

    const handleClearSearch = () => {
        navigate("/")
    }

    return (
        <main className="min-h-screen bg-gray-100 pb-10">

            {/* Categories */}
            {!searchQuery && (
                <section className="px-5 pt-6 pb-6">

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        {categories.map((category) => (
                            <div
                                key={category.title}
                                onClick={() =>
                                    handleCategoryClick(category.title)
                                }
                                className="cursor-pointer bg-white p-5 shadow-md rounded-md transition hover:scale-[1.02] hover:shadow-lg"
                            >

                                <h2 className="mb-4 text-xl font-bold text-gray-800">
                                    {category.title}
                                </h2>

                                <img
                                    src={category.image}
                                    alt={category.title}
                                    className="h-36 w-full object-cover rounded"
                                />

                                <p className="mt-4 font-semibold text-blue-600 hover:underline">
                                    See more
                                </p>

                            </div>
                        ))}

                    </div>

                </section>
            )}

            {/* Products Listing */}
            <section className="px-5 pt-5">

                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {searchQuery
                            ? `Search Results for "${searchQuery}"`
                            : "Popular Products"}
                    </h2>

                    {searchQuery && (
                        <button
                            onClick={handleClearSearch}
                            className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>

                {/* Loading */}
                {loading ? (

                    <div className="rounded-lg bg-white p-10 text-center shadow-md">
                        <p className="text-xl font-semibold text-gray-700">
                            Loading products...
                        </p>
                    </div>

                ) : filteredProducts.length === 0 ? (

                    <div className="rounded-lg bg-white p-10 text-center shadow-md">

                        <p className="text-2xl font-bold text-gray-800">
                            No products found
                        </p>

                        <p className="mt-2 text-gray-500">
                            We couldn't find any products matching "{searchQuery}".
                        </p>

                        <button
                            onClick={handleClearSearch}
                            className="mt-5 rounded-md bg-[#febd69] px-6 py-2 font-bold text-black hover:bg-[#f3a847] transition cursor-pointer"
                        >
                            View All Products
                        </button>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}

                    </div>

                )}

            </section>

        </main>
    )
}

export default Home