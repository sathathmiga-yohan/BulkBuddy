
export const mockDeals = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=85",
    originalPrice: 18000,
    groupPrice: 12999,
    joined: 16,
    required: 20,
    maxQuantity: 30,
    daysLeft: 3,
    rating: 4.8,
    discount: 28,
    seller: "TechWorld",
    description:
      "Premium wireless headphones with comfortable ear cushions and rich sound."
  },
  {
    id: 2,
    name: "Smart Watch Series Pro",
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=85",
    originalPrice: 25000,
    groupPrice: 18999,
    joined: 12,
    required: 15,
    maxQuantity: 25,
    daysLeft: 5,
    rating: 4.9,
    discount: 24,
    seller: "GadgetZone",
    description:
      "A stylish smartwatch for everyday fitness tracking and notifications."
  },
  {
    id: 3,
    name: "Professional DSLR Camera",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=85",
    originalPrice: 150000,
    groupPrice: 119999,
    joined: 7,
    required: 10,
    maxQuantity: 15,
    daysLeft: 2,
    rating: 4.7,
    discount: 20,
    seller: "CameraHub",
    description:
      "Capture beautiful photographs with this professional camera."
  },
  {
    id: 4,
    name: "Modern Running Sneakers",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=85",
    originalPrice: 16000,
    groupPrice: 10999,
    joined: 18,
    required: 25,
    maxQuantity: 35,
    daysLeft: 4,
    rating: 4.8,
    discount: 31,
    seller: "UrbanStyle",
    description:
      "Comfortable lightweight sneakers designed for daily activities."
  },
  {
    id: 5,
    name: "Portable Bluetooth Speaker",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&q=85",
    originalPrice: 12000,
    groupPrice: 7999,
    joined: 14,
    required: 20,
    maxQuantity: 30,
    daysLeft: 6,
    rating: 4.6,
    discount: 33,
    seller: "TechWorld",
    description:
      "Portable wireless speaker with clear sound and compact design."
  },
  {
    id: 6,
    name: "Classic Leather Backpack",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=85",
    originalPrice: 14000,
    groupPrice: 9999,
    joined: 9,
    required: 15,
    maxQuantity: 20,
    daysLeft: 7,
    rating: 4.7,
    discount: 29,
    seller: "UrbanStyle",
    description:
      "A spacious everyday backpack with a timeless design."
  },
  {
    id: 7,
    name: "Modern Desk Lamp",
    category: "Home & Living",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&q=85",
    originalPrice: 9500,
    groupPrice: 6499,
    joined: 11,
    required: 15,
    maxQuantity: 25,
    daysLeft: 3,
    rating: 4.5,
    discount: 32,
    seller: "HomeNest",
    description:
      "Modern lighting for your workspace or study area."
  },
  {
    id: 8,
    name: "Stainless Steel Water Bottle",
    category: "Home & Living",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&q=85",
    originalPrice: 4500,
    groupPrice: 2999,
    joined: 23,
    required: 25,
    maxQuantity: 40,
    daysLeft: 2,
    rating: 4.8,
    discount: 33,
    seller: "HomeNest",
    description:
      "Reusable stainless steel water bottle for daily hydration."
  }
];

export const dealCategories = [
  "All Categories",
  "Electronics",
  "Accessories",
  "Fashion",
  "Home & Living"
];

export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0
  }).format(amount);
