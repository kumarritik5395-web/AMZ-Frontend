import electronicsImg from "../assets/electronics.jpg"
import fashionImg from "../assets/fashion.jpg"
import booksImg from "../assets/Books.jpg"
import paymentsImg from "../assets/payments.jpg"
import teddyImg from "../assets/teddy.jpg"
import amazonProductImg from "../assets/amazon_product.jpg"
import hpLaptopImg from "../assets/hp_victus_laptop.jpg"
import macbookImg from "../assets/macbook.jpg"

export const products = [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        price: 1499,
        stock: 15,
        image: electronicsImg,
        description: "High quality wireless headphones with noise cancellation and excellent sound quality.",
        category: "Electronics"
    },
    {
        id: 2,
        name: "Men's Casual Shirt",
        price: 799,
        stock: 20,
        image: fashionImg,
        description: "100% Cotton casual shirt, comfortable fit for daily wear and relaxed style.",
        category: "Fashion"
    },
    {
        id: 3,
        name: "The Alchemist - Book",
        price: 399,
        stock: 30,
        image: booksImg,
        description: "A magical story about following your dreams by Paulo Coelho.",
        category: "Books"
    },
    {
        id: 4,
        name: "Smart Home Product",
        price: 999,
        stock: 8,
        image: paymentsImg,
        description: "Smart device to manage your home electronics with ease and automation.",
        category: "Electronics"
    },
    {
        id: 5,
        name: "Cute Plush Teddy Bear",
        price: 499,
        stock: 12,
        image: teddyImg,
        description: "Soft and adorable plush teddy bear toy with a stylish bow tie. Perfect gift for all ages.",
        category: "Toys & Games"
    },
    {
        id: 6,
        name: "Noise Twist 2 Smart Watch",
        price: 2199,
        stock: 25,
        image: amazonProductImg,
        description: "Noise Twist 2 Smart Watch with 1.43” AMOLED Screen, AI Search & Voice Assistant, Bluetooth Calling, 7-Day Battery, IP68.",
        category: "Electronics"
    },
    {
        id: 7,
        name: "HP Victus Gaming Laptop (13th Gen i7, RTX 4050)",
        price: 84990,
        stock: 5,
        image: hpLaptopImg,
        description: "HP Victus 13th Gen Intel Core i7-13620H, 6GB NVIDIA RTX 4050 GPU, 16GB DDR4 RAM, 512GB SSD, 144Hz 15.6' FHD Display, Windows 11.",
        category: "Electronics"
    },
    {
        id: 8,
        name: "Apple MacBook Air (M2 Chip, 13.6-inch)",
        price: 99900,
        stock: 7,
        image: macbookImg,
        description: "Apple MacBook Air Laptop with M2 chip, 13.6-inch Liquid Retina Display, 8GB RAM, 256GB SSD Storage, Backlit Keyboard, Midnight Silver.",
        category: "Electronics"
    },
]
