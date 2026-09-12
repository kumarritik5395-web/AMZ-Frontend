import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { products as defaultProducts } from "../data/products"
import { getSmartProductImage } from "../utils/imageHelper"
import { createProduct, updateProduct, deleteProduct, fetchProducts } from "../api"

function AdminDashboard() {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)

    // Form fields
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [stock, setStock] = useState(10)
    const [category, setCategory] = useState("Electronics")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")

    useEffect(() => {
        // Check if user is logged in AND is admin
        const userStr = localStorage.getItem("user")
        const user = userStr ? JSON.parse(userStr) : null
        const isAdmin = user?.role === "admin" || user?.isAdmin === true || user?.isAdminUser === true || user?.email?.toLowerCase() === "ritik123@gmail.com" || user?.email?.toLowerCase().includes("admin")

        if (!user || !isAdmin) {
            alert("Access Denied: Only Admin users can access this page.")
            navigate("/")
            return
        }

        const loadAdminProducts = async () => {
            // Try backend API first
            try {
                const apiProds = await fetchProducts()
                if (Array.isArray(apiProds) && apiProds.length > 0) {
                    setProducts(apiProds)
                    return
                }
            } catch (e) {
                console.warn("MongoDB products fetch failed:", e.message)
            }

            const savedProds = localStorage.getItem("custom_products")
            if (savedProds) {
                try {
                    setProducts(JSON.parse(savedProds))
                } catch (e) {
                    setProducts(defaultProducts)
                }
            } else {
                setProducts(defaultProducts)
            }
        }

        loadAdminProducts()
    }, [navigate])

    const saveProductsToStorage = (updated) => {
        setProducts(updated)
        localStorage.setItem("custom_products", JSON.stringify(updated))
    }

    const resetForm = () => {
        setName("")
        setPrice("")
        setStock(10)
        setCategory("Electronics")
        setDescription("")
        setImage("")
        setIsEditing(false)
        setEditId(null)
    }

    const handleEdit = (product) => {
        setIsEditing(true)
        setEditId(product._id || product.id)
        setName(product.title || product.name || "")
        setPrice(product.price || "")
        setStock(product.stock !== undefined ? product.stock : 10)
        setCategory(product.category || "Electronics")
        setDescription(product.description || "")
        setImage(product.image || "")
    }

    const handleQuickStockChange = async (targetProduct, delta) => {
        const targetId = targetProduct._id || targetProduct.id
        const currentStock = Number(targetProduct.stock !== undefined ? targetProduct.stock : 10)
        const newStock = Math.max(0, currentStock + delta)

        const payload = {
            ...targetProduct,
            stock: newStock,
        }

        try {
            await updateProduct(targetId, payload)
        } catch (e) {
            console.warn("Backend stock update offline fallback:", e.message)
        }

        const updated = products.map((p) => {
            if (String(p._id || p.id) === String(targetId)) {
                return { ...p, stock: newStock }
            }
            return p
        })
        saveProductsToStorage(updated)
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return

        try {
            await deleteProduct(id)
            console.log("Product deleted from MongoDB successfully")
        } catch (e) {
            console.warn("Backend delete product offline fallback:", e.message)
        }

        const updated = products.filter((p) => String(p._id || p.id) !== String(id))
        saveProductsToStorage(updated)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name || !price) {
            alert("Please fill in Product Name and Price")
            return
        }

        const payload = {
            name,
            title: name,
            price: Number(price),
            stock: Number(stock !== "" ? stock : 10),
            category,
            description,
            image: image || "",
        }

        if (isEditing) {
            try {
                await updateProduct(editId, payload)
                console.log("Product updated in MongoDB backend")
            } catch (e) {
                console.warn("Backend update product offline fallback:", e.message)
            }

            const updated = products.map((p) => {
                if (String(p._id || p.id) === String(editId)) {
                    return {
                        ...p,
                        ...payload,
                        image: image || p.image,
                    }
                }
                return p
            })
            saveProductsToStorage(updated)
            alert("Product updated successfully!")
        } else {
            let backendCreatedProd = null
            try {
                backendCreatedProd = await createProduct(payload)
                console.log("Product added to MongoDB backend successfully:", backendCreatedProd)
            } catch (e) {
                console.warn("Backend create product offline fallback:", e.message)
            }

            const newProd = {
                id: backendCreatedProd?._id || Date.now(),
                _id: backendCreatedProd?._id || "prod_" + Date.now(),
                ...payload,
            }
            saveProductsToStorage([newProd, ...products])
            alert("New product added successfully to catalog and MongoDB!")
        }

        resetForm()
    }

    return (
        <main className="min-h-screen bg-gray-100 p-5 sm:p-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            ⚙️ Admin Product & Stock Management
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Add, edit, manage stock quantity, or remove products from catalog.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Add / Edit Form */}
                    <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
                            {isEditing ? "✏️ Edit Product" : "➕ Add New Product"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Wireless Headphones"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1499"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full border rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Stock Qty *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 10"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        className="w-full border rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full border rounded-md p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-400"
                                >
                                    <option value="Electronics">Electronics</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Books">Books</option>
                                    <option value="Amazon Pay & Billing">Amazon Pay & Billing</option>
                                    <option value="Home & Kitchen">Home & Kitchen</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Image URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full border rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter product description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-md bg-[#febd69] hover:bg-[#f3a847] font-bold py-2.5 text-black shadow transition cursor-pointer text-sm"
                                >
                                    {isEditing ? "Save Changes" : "Add Product"}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-md border bg-gray-100 hover:bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Products List Table */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md overflow-hidden">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                Product Catalog ({products.length})
                            </h2>
                        </div>

                        <div className="divide-y max-h-[650px] overflow-y-auto pr-1">
                            {products.map((p) => {
                                const pId = p._id || p.id
                                const pName = p.title || p.name || "Product"
                                const pImg = getSmartProductImage(p)
                                const pStock = p.stock !== undefined ? p.stock : 10

                                return (
                                    <div
                                        key={pId}
                                        className="py-4 first:pt-0 last:pb-0 flex flex-wrap sm:flex-nowrap items-center gap-4 justify-between"
                                    >
                                        <img
                                            src={pImg}
                                            alt={pName}
                                            className="h-16 w-16 object-contain rounded border p-1"
                                            onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = getSmartProductImage({ ...p, image: "" })
                                            }}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm truncate">
                                                {pName}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Category: <span className="font-medium text-gray-700">{p.category}</span>
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-sm font-bold text-amber-700">
                                                    ₹{Number(p.price || 0).toLocaleString("en-IN")}
                                                </p>
                                                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${pStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {pStock > 0 ? `Stock: ${pStock}` : "Out of Stock"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quick Stock Controls & Action buttons */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center border rounded bg-gray-50 px-1 py-0.5">
                                                <button
                                                    onClick={() => handleQuickStockChange(p, -1)}
                                                    className="px-2 py-0.5 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded cursor-pointer"
                                                    title="Decrease stock by 1"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 text-xs font-bold text-gray-800">
                                                    {pStock}
                                                </span>
                                                <button
                                                    onClick={() => handleQuickStockChange(p, +1)}
                                                    className="px-2 py-0.5 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded cursor-pointer"
                                                    title="Increase stock by 1"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="rounded bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pId)}
                                                className="rounded bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default AdminDashboard
