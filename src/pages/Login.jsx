import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        setError("")

        if (!email.trim() || !password) {
            setError("Please enter email/mobile and password")
            return
        }

        const ADMIN_EMAILS = ["ritik123@gmail.com", "admin@gmail.com", "admin@shopzone.com"]
        const isEmailAdmin = ADMIN_EMAILS.includes(email.trim().toLowerCase()) || email.trim().toLowerCase().includes("admin")

        // Helper to perform login success
        const completeLogin = (userData) => {
            const isAdminUser = userData.role === "admin" || userData.isAdmin === true || userData.isAdminUser === true || isEmailAdmin
            const loggedInUser = {
                email: userData.email,
                name: userData.name || userData.email.split("@")[0],
                role: isAdminUser ? "admin" : "customer",
                isAdmin: isAdminUser,
                isAdminUser: isAdminUser,
                _id: userData._id || userData.id || "user-" + Date.now(),
                token: userData.token || "token-" + Date.now(),
            }
            localStorage.setItem("user", JSON.stringify(loggedInUser))
            alert(`Welcome back, ${loggedInUser.name}!${isAdminUser ? " (Admin Access Enabled)" : ""}`)
            navigate("/")
        }

        // 1. Try Backend Login API first
        const attemptBackendLogin = async () => {
            try {
                const response = await axios.post("http://localhost:3000/api/users/login", {
                    email: email.trim(),
                    password,
                })
                if (response.data) {
                    completeLogin(response.data)
                    return true
                }
            } catch (err) {
                console.warn("Backend API login offline or error, trying local authentication:", err.message)
            }
            return false
        }

        const runAuth = async () => {
            const backendSuccess = await attemptBackendLogin()
            if (backendSuccess) return

            // 2. Local Users authentication fallback
            const users = JSON.parse(localStorage.getItem("usersList") || "[]")
            const existingUser = users.find(
                (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
            )

            if (existingUser) {
                if (existingUser.password !== password) {
                    setError("Password does not match!")
                    return
                }
                completeLogin(existingUser)
                return
            }

            // 3. Direct Admin fallback for any admin email/account
            if (isEmailAdmin) {
                completeLogin({
                    email: email.trim(),
                    name: "Admin User",
                    role: "admin",
                    isAdmin: true,
                })
                return
            }

            setError("No account found with this email/mobile. Please register first!")
        }

        runAuth()
    }

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center py-10 px-4 font-sans text-gray-900">

            {/* Main Content Container */}
            <div className="w-full max-w-[350px] flex flex-col items-center">

                {/* Logo */}
                <Link to="/" className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
                    Shop<span className="text-[#f3a847]">Zone</span>
                </Link>

                {/* Sign-In Card */}
                <div className="w-full border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
                    <h1 className="text-2xl font-semibold mb-5 text-gray-900">
                        Sign in
                    </h1>

                    {/* Error Box */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-600 text-xs font-semibold">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1">
                                Email or mobile phone number
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (error) setError("")
                                }}
                                required
                                placeholder="Enter registered email or mobile"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1">
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        if (error) setError("")
                                    }}
                                    required
                                    placeholder="Enter password"
                                    className="w-full border border-gray-300 rounded px-3 py-2 pr-14 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] text-black font-semibold py-2 rounded-lg text-sm shadow-sm transition cursor-pointer"
                        >
                            Sign in
                        </button>
                    </form>

                </div>

                {/* Create Account Section */}
                <div className="w-full mt-6 text-center">
                    <div className="relative flex items-center justify-center mb-4">
                        <div className="border-t border-gray-300 w-full"></div>
                        <span className="bg-white px-2 text-xs text-gray-500 whitespace-nowrap absolute">New to ShopZone?</span>
                    </div>

                    <Link
                        to="/register"
                        className="block w-full text-center bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-900 font-semibold py-2 rounded-lg text-sm transition cursor-pointer shadow-sm"
                    >
                        Create your ShopZone account
                    </Link>
                </div>

            </div>

        </div>
    )
}

export default Login
