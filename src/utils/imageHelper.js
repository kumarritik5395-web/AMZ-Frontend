import electronicsImg from "../assets/electronics.jpg"
import fashionImg from "../assets/fashion.jpg"
import booksImg from "../assets/Books.jpg"
import paymentsImg from "../assets/payments.jpg"
import teddyImg from "../assets/teddy.jpg"
import amazonProductImg from "../assets/amazon_product.jpg"
import hpLaptopImg from "../assets/hp_victus_laptop.jpg"
import macbookImg from "../assets/macbook.jpg"

export const getSmartProductImage = (product) => {
    if (!product) return electronicsImg

    const imageStr = typeof product === "string"
        ? product
        : (product?.image || product?.imageUrl || product?.image_url || product?.img || product?.url)

    const title = ((product?.title || product?.name || "") + "").toLowerCase()
    const cat = ((product?.category || "") + "").toLowerCase()

    // 1. Valid URL or path check (Supports HTTP/HTTPS, Data URI, relative/absolute paths)
    if (
        typeof imageStr === "string" &&
        imageStr.trim().length > 3
    ) {
        const cleanImg = imageStr.trim()
        if (
            cleanImg.startsWith("http://") ||
            cleanImg.startsWith("https://") ||
            cleanImg.startsWith("data:") ||
            cleanImg.startsWith("blob:") ||
            cleanImg.startsWith("/") ||
            cleanImg.startsWith("./") ||
            cleanImg.includes("static/") ||
            cleanImg.includes("/") ||
            cleanImg.includes("http") ||
            /\.(jpg|jpeg|png|webp|avif|svg|gif)($|\?)/i.test(cleanImg)
        ) {
            return cleanImg
        }
    }

    // 2. Title & Category keyword matching fallback
    if (title.includes("macbook") || title.includes("mac book") || title.includes("apple mac")) return macbookImg
    if (title.includes("book") || cat.includes("book") || title.includes("alchemist")) return booksImg
    if (title.includes("shirt") || title.includes("pant") || title.includes("fashion") || title.includes("cloth") || cat.includes("fashion")) return fashionImg
    if (title.includes("laptop") || title.includes("computer") || title.includes("victus") || title.includes("pc")) return hpLaptopImg
    if (title.includes("watch") || title.includes("noise") || title.includes("smart watch") || title.includes("clock")) return amazonProductImg
    if (title.includes("teddy") || title.includes("bear") || title.includes("toy") || cat.includes("toy")) return teddyImg
    if (title.includes("headphone") || title.includes("earphone") || title.includes("audio") || title.includes("bluetooth")) return electronicsImg
    if (title.includes("pay") || title.includes("billing") || title.includes("home") || cat.includes("home")) return paymentsImg

    // 3. Category Fallback
    if (cat.includes("fashion")) return fashionImg
    if (cat.includes("book")) return booksImg
    if (cat.includes("toy")) return teddyImg

    return electronicsImg
}
