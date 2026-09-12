import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { syncUserCart } from "./cartSlice"

function Navbar() {
    const dispatch = useDispatch()
    const cartItems = useSelector((state) => state.cart.items)
    const totalCount = cartItems.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
    )

    const [searchParams] = useSearchParams()
    const [search, setSearch] = useState(searchParams.get("search") || "")
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        setSearch(searchParams.get("search") || "")

        try {
            const savedUser = localStorage.getItem("user")
            if (savedUser) {
                setUser(JSON.parse(savedUser))
            } else {
                setUser(null)
            }
        } catch (e) {
            console.error(e)
        }

        // Sync user cart whenever navigation/route changes
        dispatch(syncUserCart())
    }, [searchParams, dispatch])

    const handleSearch = () => {
        if (search.trim()) {
            navigate(`/?search=${encodeURIComponent(search.trim())}`)
        } else {
            navigate("/")
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    const handleCategoryClick = (categoryName) => {
        navigate(`/?search=${encodeURIComponent(categoryName)}`)
    }

    const handleLogout = () => {
        localStorage.removeItem("user")
        setUser(null)
        dispatch(syncUserCart())
        navigate("/login")
    }

    return (
        <header className="text-white sticky top-0 z-50 shadow-md">

            {/* Main Navbar */}
            <div className="flex items-center gap-3 sm:gap-5 bg-[#131921] px-4 py-3">

                {/* Logo */}
                <Link
                    to="/"
                    className="text-2xl font-bold whitespace-nowrap cursor-pointer hover:opacity-90"
                >
                    ShopZone
                </Link>

                {/* Delivery */}
                <div className="hidden md:block">
                    <p className="text-xs text-gray-300">
                        Deliver to
                    </p>
                    <p className="font-bold text-sm">
                        India
                    </p>
                </div>

                {/* Search Bar */}
                <div className="flex flex-1">

                    <input
                        type="text"
                        placeholder="Search ShopZone products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full rounded-l-md px-4 py-2 text-black outline-none bg-white text-sm sm:text-base"
                    />

                    <button
                        onClick={handleSearch}
                        className="rounded-r-md bg-[#febd69] px-5 text-black hover:bg-[#f3a847] transition cursor-pointer font-bold"
                    >
                        🔍
                    </button>

                </div>

                {/* Account / Login */}
                {user ? (
                    <div
                        onClick={handleLogout}
                        title="Click to Logout"
                        className="hidden md:block cursor-pointer hover:text-[#febd69]"
                    >
                        <p className="text-xs text-gray-300">
                            Hello, {user.name}
                        </p>
                        <p className="font-bold text-sm">
                            Sign Out
                        </p>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="hidden md:block cursor-pointer hover:text-[#febd69]"
                    >
                        <p className="text-xs text-gray-300">
                            Hello, sign in
                        </p>
                        <p className="font-bold text-sm">
                            Account & Lists
                        </p>
                    </Link>
                )}

                {/* Orders */}
                <Link
                    to="/orders"
                    className="hidden md:block cursor-pointer hover:text-[#febd69] transition"
                >
                    <p className="text-xs text-gray-300">
                        Returns
                    </p>
                    <p className="font-bold text-sm">
                        & Orders
                    </p>
                </Link>

                {/* Cart */}
                <Link
                    to="/cart"
                    className="flex items-center gap-1 cursor-pointer text-white hover:text-[#febd69] transition"
                >
                    <div className="relative flex items-center">
                        <span className="text-3xl">
                            🛒
                        </span>

                        <span className="absolute -top-1 -right-2 rounded-full bg-[#febd69] text-black font-bold text-xs px-1.5 py-0.5">
                            {totalCount}
                        </span>
                    </div>

                    <span className="font-bold text-sm ml-2 hidden sm:inline">
                        Cart
                    </span>
                </Link>

            </div>

            {/* Secondary Navbar */}
            <div className="flex gap-6 bg-[#232f3e] px-5 py-2 text-sm font-semibold overflow-x-auto whitespace-nowrap">

                <Link
                    to="/"
                    className="cursor-pointer hover:text-[#febd69] transition"
                >
                    ☰ All
                </Link>

                <button
                    onClick={() => handleCategoryClick("Electronics")}
                    className="cursor-pointer hover:text-[#febd69] transition"
                >
                    Electronics
                </button>

                <button
                    onClick={() => handleCategoryClick("Fashion")}
                    className="cursor-pointer hover:text-[#febd69] transition"
                >
                    Fashion
                </button>

                <button
                    onClick={() => handleCategoryClick("Books")}
                    className="cursor-pointer hover:text-[#febd69] transition"
                >
                    Books
                </button>

                <button
                    onClick={() => handleCategoryClick("Deals")}
                    className="cursor-pointer hover:text-[#febd69] transition"
                >
                    Today's Deals
                </button>

                <button
                    onClick={() => handleCategoryClick("Best Sellers")}
                    className="cursor-pointer hover:text-[#febd69] transition"
                >
                    Best Sellers
                </button>

                {user && (user.role === "admin" || user.isAdmin === true || user.isAdminUser === true || user.email?.toLowerCase() === "ritik123@gmail.com" || user.email?.toLowerCase().includes("admin")) ? (
                    <Link
                        to="/admin"
                        className="cursor-pointer bg-amber-500 text-black px-2.5 py-0.5 rounded font-extrabold hover:bg-amber-400 transition ml-auto text-xs flex items-center gap-1"
                    >
                        ⚙️ Admin Panel
                    </Link>
                ) : null}

            </div>

        </header>
    )
}

export default Navbar