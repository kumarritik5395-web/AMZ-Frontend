import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleRegister = (e) => {
        e.preventDefault()
        setError("")

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setError("Please fill in all fields")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match!")
            return
        }

        const newUser = { name: name.trim(), email: email.trim(), password }
        const users = JSON.parse(localStorage.getItem("usersList") || "[]")

        const userExists = users.some(
            (u) => u.email.toLowerCase() === email.trim().toLowerCase()
        )

        if (userExists) {
            setError("An account with this email/mobile already exists. Please login!")
            return
        }

        const userId = "user-" + Date.now()
        const isAdmin = email.trim().toLowerCase().includes("admin") || name.trim().toLowerCase().includes("admin")
        const role = isAdmin ? "admin" : "customer"
        const userToSave = { ...newUser, _id: userId, role, isAdmin }
        users.push(userToSave)
        localStorage.setItem("usersList", JSON.stringify(users))
        localStorage.setItem("user", JSON.stringify({ email: newUser.email, name: newUser.name, role, isAdmin, _id: userId, token: "token-" + Date.now() }))

        alert(`Account created successfully! Welcome, ${newUser.name}!`)
        navigate("/")
    }

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center py-10 px-4 font-sans text-gray-900">

            {/* Main Content Container */}
            <div className="w-full max-w-[350px] flex flex-col items-center">

                {/* Logo */}
                <Link to="/" className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
                    Shop<span className="text-[#f3a847]">Zone</span>
                </Link>

                {/* Registration Card */}
                <div className="w-full border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
                    <h1 className="text-2xl font-semibold mb-5 text-gray-900">
                        Create Account
                    </h1>

                    {/* Error Box */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-600 text-xs font-semibold">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1">
                                Your name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    if (error) setError("")
                                }}
                                required
                                placeholder="First and last name"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1">
                                Mobile number or email
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (error) setError("")
                                }}
                                required
                                placeholder="Enter email or mobile"
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
                                    placeholder="At least 6 characters"
                                    minLength={6}
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

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1">
                                Re-enter password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value)
                                    if (error) setError("")
                                }}
                                required
                                placeholder="Confirm password"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] text-black font-semibold py-2 rounded-lg text-sm shadow-sm transition cursor-pointer mt-2"
                        >
                            Create your ShopZone account
                        </button>
                    </form>

                    <div className="mt-5 border-t border-gray-200 pt-4 text-xs text-gray-900">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline font-bold">
                            Sign in
                        </Link>
                    </div>

                </div>

            </div>

        </div>
    )
}

export default Register
