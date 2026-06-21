import { ProductsType } from "@/types";
import moetchandonimperiallg from '@/public/products/moet-chandon-imperial_lg.jpg'
import moetchandonimperial_md from '@/public/products/moet-chandon-imperial_md.jpg'
import moetchandonimperial_sm from '@/public/products/moet-chandon-imperial_sm.jpg'
import hennessy_lg from '@/public/products/hennessy_lg.jpg'
import jackdaniels_lg from '@/public/products/jackdaniels_lg.jpg'
import hennessyXO_lg from '@/public/products/hennessyXO_lg.jpg'
import DomPérignon_lg from '@/public/products/DomPérignon_lg.jpg'
import moetchandonnectar_lg from '@/public/products/moetchandonnectar_lg.jpg'
import martellblue_lg from '@/public/products/martellblue_lg.jpg'
import remymartin_lg from '@/public/products/remymartin_lg.jpg'
import patronsilvertequila_aj from '@/public/products/patronsilvertequila_aj.jpg'
import Nespresso_Vertuo_Coffee_Machine from '@/public/products/Nespresso_Vertuo_Coffee_Machine.jpg'
import KitchenAid_Artisan_Stand_Mixer from '@/public/products/KitchenAid_Artisan_Stand_Mixer.jpg'
import Birthday_Party_Package from '@/public/products/Birthday_Party_Package.jpg'
import Premium_Backyard_BBQ_Package from '@/public/products/Premium_Backyard_BBQ_Package.jpg'

export const products: ProductsType = [
  // --- INCLUDED BASE PRODUCTS (1 to 11) ---
  {
    id: "prod_1",
    slug: "moet-chandon-imperial",
    name: "Moët & Chandon Impérial",
    shortDescription: "Premium French champagne crafted for celebrations and luxury events.",
    longDescription: "Moët & Chandon Impérial is one of the world's most celebrated champagnes. Its vibrant fruitiness, elegant maturity, and seductive palate make it the perfect choice for weddings, birthdays, corporate celebrations, and exclusive gatherings.",
    category: "wines",
    tags: ["Express Delivery", "Party Plan", "Luxury", "Best Seller"],
    variants: [
      { id: "Sm", label: "small", image: moetchandonimperiallg.src, price: 75000, stockLeft: 8 },
      { id: "Md", label: "Medium", image: moetchandonimperial_md.src, price: 85000, stockLeft: 6 },
      { id: "Lg", label: "Large", image: moetchandonimperial_sm.src, price: 95000, stockLeft: 3 }
    ],
    rating: 4.7,
    reviews: 186,
    soldCount: 324,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 15
  },
  {
    id: "prod_2",
    slug: "hennessy-vs-cognac",
    name: "Hennessy VS Cognac",
    shortDescription: "Smooth and bold cognac perfect for parties and nightlife events.",
    longDescription: "Hennessy VS Cognac offers a balanced blend of strength and elegance. Known for its rich oak notes and warm finish, it is a popular choice for club events, celebrations, VIP gatherings, and private parties.",
    category: "spirits",
    tags: ["Express Delivery", "Popular", "Party Favorite"],
    variants: [
      { id: "Sm", label: "Small", image: hennessy_lg.src, price: 55000, stockLeft: 10 },
      { id: "Md", label: "Medium", image: hennessy_lg.src, price: 62000, stockLeft: 14 },
      { id: "Lg", label: "Large", image: hennessy_lg.src, price: 70000, stockLeft: 7 }
    ],
    rating: 4.8,
    reviews: 154,
    soldCount: 278,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 10
  },
  {
    id: "prod_3",
    slug: "jack-daniels-old-no-7",
    name: "Jack Daniel's Old No. 7",
    shortDescription: "Iconic Tennessee whiskey with a smooth charcoal-mellowed finish.",
    longDescription: "Jack Daniel's Old No. 7 is crafted using a unique charcoal mellowing process that gives it a smooth and distinctive flavor.",
    category: "spirits",
    tags: ["Bulk Order", "Best Seller", "Premium"],
    variants: [
      { id: "Sm", label: "Small", image: jackdaniels_lg.src, price: 40000, stockLeft: 0 },
      { id: "Md", label: "Medium", image: jackdaniels_lg.src, price: 45000, stockLeft: 0 },
      { id: "Lg", label: "Large", image: jackdaniels_lg.src, price: 50000, stockLeft: 0 }
    ],
    rating: 4.7,
    reviews: 173,
    soldCount: 311,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "Out of Stock",
    discountPercentage: 12
  },
  {
    id: "prod_4",
    slug: "red-velvet-celebration-cake",
    name: "Red Velvet Celebration Cake",
    shortDescription: "Freshly baked red velvet cake designed for memorable celebrations.",
    longDescription: "Our Red Velvet Celebration Cake is layered with rich cream cheese frosting.",
    category: "confectioneries",
    tags: ["Express Delivery", "Party Plan", "Freshly Baked"],
    variants: [
      { id: "sm", label: "Small", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop", price: 15000, stockLeft: 6 },
      { id: "md", label: "Medium", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop", price: 18000, stockLeft: 12 },
      { id: "lg", label: "Large", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop", price: 22000, stockLeft: 4 }
    ],
    rating: 4.6,
    reviews: 87,
    soldCount: 142,
    liked: false,
    featured: false,
    isNew: true,
    estimatedDelivery: "2 - 5 Hours",
    discountPercentage: 8
  },
  {
    id: "prod_5",
    slug: "moet-chandon-nectar",
    name: "Moët & Chandon Nectar Impérial",
    shortDescription: "Deliciously sweet French champagne with exotic fruitiness.",
    longDescription: "Nectar Impérial is a delicious expression of the Moët & Chandon style, distinguishing itself by its tropical fruitiness, its richness on the palate and its crisp finish.",
    category: "wines",
    tags: ["Express Delivery", "Luxury", "Sweet Wine"],
    variants: [
      { id: "sm", label: "Small", image: moetchandonnectar_lg.src, price: 78000, stockLeft: 5 },
      { id: "md", label: "Medium", image: moetchandonnectar_lg.src, price: 88000, stockLeft: 7 }
    ],
    rating: 4.7,
    reviews: 112,
    soldCount: 198,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 10
  },
  {
    id: "prod_6",
    slug: "hennessy-xo-luxury",
    name: "Hennessy XO Cognac",
    shortDescription: "The original extra-old cognac, deep, complex, and intensely powerful.",
    longDescription: "Hennessy X.O is the original emblematic icon of the Hennessy House. Deep and powerful, the eaux-de-vie of this Cognac are aged in young oak barrels, characterized by their power and energy.",
    category: "spirits",
    tags: ["Luxury", "Premium", "VIP Favorite"],
    variants: [
      { id: "md", label: "70cl", image: hennessyXO_lg.src, price: 245000, stockLeft: 4 },
      { id: "lg", label: "1.5L", image: hennessyXO_lg.src, price: 480000, stockLeft: 2 }
    ],
    rating: 4.9,
    reviews: 64,
    soldCount: 112,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 5
  },
  {
    id: "prod_7",
    slug: "dom-perignon-vintage",
    name: "Dom Pérignon Vintage",
    shortDescription: "Luxury vintage champagne for premium celebrations.",
    longDescription: "Dom Pérignon Vintage delivers refined bubbles, floral aromas and a luxurious finish suitable for weddings, anniversaries and executive events.",
    category: "wines",
    tags: ["Luxury", "Premium", "Best Seller"],
    variants: [
      { id: "sm", label: "750ml", image: DomPérignon_lg.src, price: 165000, stockLeft: 4 },
      { id: "md", label: "1.5L", image: DomPérignon_lg.src, price: 290000, stockLeft: 2 }
    ],
    rating: 4.9,
    reviews: 241,
    soldCount: 411,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 5
  },
  {
    id: "prod_8",
    slug: "martell-blue-swift",
    name: "Martell Blue Swift",
    shortDescription: "Premium cognac finished in bourbon casks.",
    longDescription: "Martell Blue Swift combines French cognac tradition with American oak finishing for a smooth and rich experience.",
    category: "spirits",
    tags: ["Premium", "Popular"],
    variants: [
      { id: "sm", label: "70cl", image: martellblue_lg.src, price: 78000, stockLeft: 11 },
      { id: "md", label: "1L", image: martellblue_lg.src, price: 99000, stockLeft: 6 }
    ],
    rating: 4.8,
    reviews: 193,
    soldCount: 344,
    liked: false,
    featured: true,
    isNew: true,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 10
  },
  {
    id: "prod_9",
    slug: "chocolate-fudge-cake",
    name: "Chocolate Fudge Cake",
    shortDescription: "Rich chocolate cake perfect for birthdays and celebrations.",
    longDescription: "Made with premium cocoa and layered chocolate frosting, ideal for parties and family events.",
    category: "confectioneries",
    tags: ["Freshly Baked", "Party Favorite"],
    variants: [
      { id: "sm", label: "Small", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", price: 12000, stockLeft: 14 },
      { id: "md", label: "Medium", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", price: 18000, stockLeft: 9 },
      { id: "lg", label: "Large", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", price: 25000, stockLeft: 3 }
    ],
    rating: 4.6,
    reviews: 129,
    soldCount: 287,
    liked: false,
    featured: false,
    isNew: true,
    estimatedDelivery: "2 - 4 Hours",
    discountPercentage: 15
  },
  {
    id: "prod_10",
    slug: "birthday-party-package",
    name: "Birthday Party Package",
    shortDescription: "Complete party package for birthdays and celebrations.",
    longDescription: "Includes decorations, balloons, tables, chairs and event coordination services for memorable celebrations.",
    category: "party-plans",
    tags: ["Party Plan", "Event Package"],
    variants: [
      { id: "basic", label: "Basic", image: Birthday_Party_Package.src, price: 85000, stockLeft: 12 },
      { id: "premium", label: "Premium", image: Birthday_Party_Package.src, price: 150000, stockLeft: 7 },
      { id: "vip", label: "VIP", image: Birthday_Party_Package.src, price: 300000, stockLeft: 3 }
    ],
    rating: 4.8,
    reviews: 97,
    soldCount: 172,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "24 Hours Notice",
    discountPercentage: 20
  },
  {
    id: "prod_11",
    slug: "digital-air-fryer",
    name: "Digital Air Fryer",
    shortDescription: "Healthy cooking with little or no oil.",
    longDescription: "Large capacity digital air fryer suitable for homes, restaurants and catering businesses.",
    category: "kitchen",
    tags: ["Kitchen", "Best Seller"],
    variants: [
      { id: "4l", label: "4L", image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80", price: 55000, stockLeft: 15 },
      { id: "8l", label: "8L", image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80", price: 85000, stockLeft: 8 }
    ],
    rating: 4.7,
    reviews: 143,
    soldCount: 398,
    liked: false,
    featured: true,
    isNew: true,
    estimatedDelivery: "1 - 2 Days",
    discountPercentage: 12
  },

  // --- ADDITIONAL MOCK PRODUCTS (12 to 40) ---
  {
    id: "prod_12",
    slug: "veuve-clicquot-brut",
    name: "Veuve Clicquot Yellow Label",
    shortDescription: "Superb non-vintage Champagne, recognizable by its bright yellow label.",
    longDescription: "Veuve Clicquot offers an optimal balance between forcefulness and aromatic freshness with distinct notes of fruit and brioche.",
    category: "wines",
    tags: ["Express Delivery", "Luxury", "Popular"],
    variants: [
      { id: "sm", label: "750ml", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80", price: 82000, stockLeft: 14 }
    ],
    rating: 4.8,
    reviews: 165,
    soldCount: 299,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 5
  },
  {
    id: "prod_13",
    slug: "glenfiddich-12-year",
    name: "Glenfiddich 12 Year Old",
    shortDescription: "The world's most awarded single malt Scotch whisky.",
    longDescription: "Carefully matured in the finest American oak and European oak sherry casks for at least 12 years, giving it distinct fresh pear and oak flavors.",
    category: "spirits",
    tags: ["Single Malt", "Best Seller", "Express Delivery"],
    variants: [
      { id: "md", label: "70cl", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 68000, stockLeft: 22 },
      { id: "lg", label: "1L", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 85000, stockLeft: 11 }
    ],
    rating: 4.7,
    reviews: 210,
    soldCount: 415,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 8
  },
  {
    id: "prod_14",
    slug: "remy-martin-vsop",
    name: "Rémy Martin VSOP Cognac",
    shortDescription: "The iconic Cognac Fine Champagne with perfectly balanced character.",
    longDescription: "Rémy Martin VSOP embodies the perfect harmony of powerful and elegant aromas. It reveals notes of vanilla, ripe apricot, and baked apple.",
    category: "spirits",
    tags: ["Premium", "Express Delivery"],
    variants: [
      { id: "sm", label: "70cl", image: remymartin_lg.src, price: 74000, stockLeft: 16 }
    ],
    rating: 4.6,
    reviews: 134,
    soldCount: 221,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 10
  },
  {
    id: "prod_15",
    slug: "johnnie-walker-black",
    name: "Johnnie Walker Black Label",
    shortDescription: "A true icon, recognized as the benchmark for all other luxury blends.",
    longDescription: "Created using only whiskies aged for a minimum of 12 years from the four corners of Scotland, Johnnie Walker Black Label has an unmistakably smooth, deep, complex character.",
    category: "spirits",
    tags: ["Best Seller", "Express Delivery", "Party Favorite"],
    variants: [
      { id: "sm", label: "70cl", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 42000, stockLeft: 45 },
      { id: "md", label: "1L", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 54000, stockLeft: 30 }
    ],
    rating: 4.7,
    reviews: 312,
    soldCount: 680,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 12
  },
  {
    id: "prod_16",
    slug: "johnnie-walker-blue",
    name: "Johnnie Walker Blue Label",
    shortDescription: "An exquisite blend made from some of Scotland’s rarest whiskies.",
    longDescription: "Only one in every ten thousand casks has the elusive quality and character to deliver the remarkably smooth signature taste of Johnnie Walker Blue Label.",
    category: "spirits",
    tags: ["Luxury", "Ultra Premium", "VIP Favorite"],
    variants: [
      { id: "lg", label: "750ml", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 295000, stockLeft: 5 }
    ],
    rating: 4.9,
    reviews: 48,
    soldCount: 89,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 0
  },
  {
    id: "prod_17",
    slug: "patron-silver-tequila",
    name: "Patrón Silver Tequila",
    shortDescription: "The perfect ultra-premium white spirit crafted from 100% Weber Blue Agave.",
    longDescription: "Handcrafted in small batches, Patrón Silver is smooth, sweet, and easily mixable, making it a favorite for signature luxury cocktails and top-tier parties.",
    category: "spirits",
    tags: ["Tequila", "Premium", "Express Delivery"],
    variants: [
      { id: "md", label: "750ml", image: patronsilvertequila_aj.src, price: 72000, stockLeft: 18 }
    ],
    rating: 4.8,
    reviews: 142,
    soldCount: 260,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 5
  },
  {
    id: "prod_18",
    slug: "chandon-garden-spritz",
    name: "Chandon Garden Spritz",
    shortDescription: "A ready-to-serve sparkling wine blend with bitter orange liqueur extract.",
    longDescription: "Chandon Garden Spritz combines top-tier sparkling wine with a house-made bitter liqueur recipe made from local, handpicked orange peels, herbs, and spices.",
    category: "wines",
    tags: ["Express Delivery", "New Trend", "Brunch Classic"],
    variants: [
      { id: "sm", label: "750ml", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80", price: 38000, stockLeft: 20 }
    ],
    rating: 4.5,
    reviews: 53,
    soldCount: 110,
    liked: false,
    featured: false,
    isNew: true,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 10
  },
  {
    id: "prod_19",
    slug: "four-cousins-sweet-rose",
    name: "Four Cousins Sweet Rosé",
    shortDescription: "A popular, easy-drinking sweet rosé wine perfect for causal get-togethers.",
    longDescription: "A vibrant, ruby-colored sweet rosé with hints of tropical fruits and gentle spicy aromas. A staple choice for social parties and gatherings across the region.",
    category: "wines",
    tags: ["Express Delivery", "Budget Friendly", "Sweet Wine"],
    variants: [
      { id: "md", label: "750ml", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80", price: 12000, stockLeft: 50 },
      { id: "lg", label: "1.5L", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80", price: 21000, stockLeft: 35 }
    ],
    rating: 4.4,
    reviews: 420,
    soldCount: 1240,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 5
  },
  {
    id: "prod_20",
    slug: "jameson-irish-whiskey",
    name: "Jameson Irish Whiskey",
    shortDescription: "Triple-distilled Irish whiskey, remarkably smooth and versatile.",
    longDescription: "Jameson is a blended Irish whiskey made from the finest pot still and grain whiskies, triple distilled to achieve signature smoothness and aged in oak casks for a minimum of 4 years.",
    category: "spirits",
    tags: ["Express Delivery", "Best Seller", "Bar Classic"],
    variants: [
      { id: "sm", label: "70cl", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 32000, stockLeft: 40 },
      { id: "lg", label: "1L", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 44000, stockLeft: 25 }
    ],
    rating: 4.7,
    reviews: 289,
    soldCount: 610,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 8
  },
  {
    id: "prod_21",
    slug: "don-julio-1942",
    name: "Don Julio 1942 Añejo Tequila",
    shortDescription: "An exceptional luxury tequila celebrated in exclusive cocktail lounges worldwide.",
    longDescription: "Produced in small batches and aged for a minimum of two and a half years, Don Julio 1942 Añejo Tequila is handcrafted in tribute to the year that Don Julio González began his tequila-making journey.",
    category: "spirits",
    tags: ["Luxury", "Tequila", "VIP Elite"],
    variants: [
      { id: "md", label: "750ml", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 310000, stockLeft: 3 }
    ],
    rating: 4.9,
    reviews: 72,
    soldCount: 145,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 0
  },
  {
    id: "prod_22",
    slug: "belvedere-vodka-classic",
    name: "Belvedere Vodka",
    shortDescription: "The definition of luxury vodka, crafted from Polish rye and purified water.",
    longDescription: "Belvedere Vodka is completely free of additives, gluten-free, and structured with a complex character profile containing notes of vanilla and white pepper.",
    category: "spirits",
    tags: ["Vodka", "Premium", "Express Delivery"],
    variants: [
      { id: "sm", label: "70cl", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 48000, stockLeft: 19 },
      { id: "md", label: "1L", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 62000, stockLeft: 12 }
    ],
    rating: 4.7,
    reviews: 95,
    soldCount: 184,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 10
  },
  {
    id: "prod_23",
    slug: "strawberry-cheesecake",
    name: "Gourmet Strawberry Cheesecake",
    shortDescription: "Creamy New York style cheesecake topped with sweet glazed strawberries.",
    longDescription: "Baked on a traditional graham cracker crust, our cheesecake is velvety rich, loaded with premium cream cheese, and finished off with vibrant, handpicked fresh strawberries.",
    category: "confectioneries",
    tags: ["Freshly Baked", "Dessert Classic"],
    variants: [
      { id: "md", label: "Medium", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", price: 16500, stockLeft: 5 },
      { id: "lg", label: "Large", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", price: 24000, stockLeft: 3 }
    ],
    rating: 4.6,
    reviews: 74,
    soldCount: 119,
    liked: false,
    featured: false,
    isNew: true,
    estimatedDelivery: "3 - 5 Hours",
    discountPercentage: 5
  },
  {
    id: "prod_24",
    slug: "assorted-cupcake-box",
    name: "Assorted Velvet Cupcake Box",
    shortDescription: "A decadent box of 12 luxury cupcakes in assorted popular flavors.",
    longDescription: "Includes four Red Velvet, four Double Chocolate, and four Salted Caramel cupcakes, heavily frosted and decorated for events, parties, or gifts.",
    category: "confectioneries",
    tags: ["Express Delivery", "Freshly Baked", "Party Fingerfood"],
    variants: [
      { id: "12pack", label: "Box of 12", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", price: 14000, stockLeft: 20 }
    ],
    rating: 4.7,
    reviews: 115,
    soldCount: 310,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 10
  },
  {
    id: "prod_25",
    slug: "corporate-cocktail-package",
    name: "Corporate Cocktail Mixer Plan",
    shortDescription: "Complete mobile bar set up for corporate mixers and private networking events.",
    longDescription: "Includes a professional mixologist team for 4 hours, a premium portable bar console, glassware, garnishes, ice supply, and full menu coordination for up to 50 guests.",
    category: "party-plans",
    tags: ["Party Plan", "Premium Service", "Corporate"],
    variants: [
      { id: "std", label: "Up to 50 Guests", image: KitchenAid_Artisan_Stand_Mixer.src, price: 450000, stockLeft: 2 },
      { id: "xl", label: "Up to 120 Guests", image: KitchenAid_Artisan_Stand_Mixer.src, price: 850000, stockLeft: 1 }
    ],
    rating: 4.9,
    reviews: 38,
    soldCount: 64,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "48 Hours Notice",
    discountPercentage: 5
  },
  {
    id: "prod_26",
    slug: "backyard-bbq-setup",
    name: "Premium Backyard BBQ Package",
    shortDescription: "Live grill catering and outdoor seating configuration for house parties.",
    longDescription: "We bring the party straight to your compound. Comes with full charcoal industrial grill stations, professional pitmaster chefs, 20 luxury outdoor chairs, 4 dynamic banquet tables, and speaker systems.",
    category: "party-plans",
    tags: ["Party Plan", "Outdoor Event", "Live Catering"],
    variants: [
      { id: "base", label: "Standard Setup", image: Premium_Backyard_BBQ_Package.src, price: 280000, stockLeft: 4 }
    ],
    rating: 4.8,
    reviews: 51,
    soldCount: 92,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "24 Hours Notice",
    discountPercentage: 10
  },
  {
    id: "prod_27",
    slug: "nespresso-coffee-maker",
    name: "Nespresso Vertuo Coffee Machine",
    shortDescription: "Automated premium espresso and coffee maker with smart capsule scanning.",
    longDescription: "Bring cafe-level tech to your kitchen counter. Brews 5 different cup sizes instantly with intelligent laser capsule code scanning technology and automatic extraction tuning.",
    category: "kitchen",
    tags: ["Kitchen", "Premium Appliance"],
    variants: [
      { id: "solo", label: "Machine Only", image: Nespresso_Vertuo_Coffee_Machine.src, price: 185000, stockLeft: 6 },
      { id: "bundle", label: "Machine + Aeroccino", image: Nespresso_Vertuo_Coffee_Machine.src, price: 240000, stockLeft: 4 }
    ],
    rating: 4.7,
    reviews: 82,
    soldCount: 145,
    liked: false,
    featured: false,
    isNew: true,
    estimatedDelivery: "1 - 2 Days",
    discountPercentage: 15
  },
  {
    id: "prod_28",
    slug: "high-speed-blender",
    name: "NutriBullet Professional Blender",
    shortDescription: "1200W high-speed nutrient extractor and smoothie processor.",
    longDescription: "Features cyclonic blade action and a robust 1200-watt motor base to easily break down tough ice, frozen fruits, nuts, and fibrous local vegetables effortlessly.",
    category: "kitchen",
    tags: ["Kitchen", "Best Seller"],
    variants: [
      { id: "std", label: "9-Piece Set", image: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=600&q=80", price: 95000, stockLeft: 15 }
    ],
    rating: 4.6,
    reviews: 194,
    soldCount: 412,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 2 Days",
    discountPercentage: 8
  },
  {
    id: "prod_29",
    slug: "casa-madero-cabernet",
    name: "Casa Madero Cabernet Sauvignon",
    shortDescription: "Rich, deep red wine with structural oak integration and ripe berry notes.",
    longDescription: "An elegant red wine perfect for pairing with grilled steaks or rich pasta dishes. Features an aromatic profile of dark plum, vanilla, and cocoa.",
    category: "wines",
    tags: ["Express Delivery", "Red Wine", "Dinner Choice"],
    variants: [
      { id: "sm", label: "750ml", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80", price: 34000, stockLeft: 18 }
    ],
    rating: 4.5,
    reviews: 67,
    soldCount: 140,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 10
  },
  {
    id: "prod_30",
    slug: "macallan-12-double-cask",
    name: "The Macallan 12 Year Double Cask",
    shortDescription: "A perfectly balanced single malt defined by American and European oak aging.",
    longDescription: "The Double Cask 12 Years Old forms part of Macallan's central range, highlighting a flawless synchronization of honey, citrus, and sweet ginger profiles.",
    category: "spirits",
    tags: ["Luxury", "Single Malt", "Best Seller"],
    variants: [
      { id: "70cl", label: "70cl", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 115000, stockLeft: 9 }
    ],
    rating: 4.9,
    reviews: 156,
    soldCount: 290,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 5
  },
  {
    id: "prod_31",
    slug: "tanqueray-london-dry-gin",
    name: "Tanqueray London Dry Gin",
    shortDescription: "An exceptionally balanced botanic dry gin curated for premium gin and tonics.",
    longDescription: "Tanqueray London Dry Gin is distilled four times to ensure absolute smoothness, locking in the core profiles of juniper, coriander, angelica root, and liquorice.",
    category: "spirits",
    tags: ["Gin", "Express Delivery", "Bar Classic"],
    variants: [
      { id: "md", label: "750ml", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 29000, stockLeft: 24 },
      { id: "lg", label: "1L", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 38000, stockLeft: 16 }
    ],
    rating: 4.6,
    reviews: 143,
    soldCount: 399,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 12
  },
  {
    id: "prod_32",
    slug: "bombay-sapphire-gin",
    name: "Bombay Sapphire Distilled Gin",
    shortDescription: "World-famous gin housed in its iconic, translucent blue glass bottle.",
    longDescription: "Crafted using 10 vapor-infused, exotic botanicals sustainably sourced from around the globe, creating a uniquely bright, fresh, and complex aromatic flavor profile.",
    category: "spirits",
    tags: ["Gin", "Express Delivery", "Popular"],
    variants: [
      { id: "sm", label: "70cl", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 31000, stockLeft: 33 }
    ],
    rating: 4.7,
    reviews: 182,
    soldCount: 450,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 10
  },
  {
    id: "prod_33",
    slug: "glenmorangie-original",
    name: "Glenmorangie The Original 10Y",
    shortDescription: "The backbone signature single malt Scotch whisky from Highland distillery.",
    longDescription: "Distilled in Scotland's tallest copper stills and matured for ten long years in premium bourbon oak casks to express notes of vanilla, citrus fruits, and peach.",
    category: "spirits",
    tags: ["Single Malt", "Express Delivery", "Premium"],
    variants: [
      { id: "md", label: "70cl", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 74000, stockLeft: 12 }
    ],
    rating: 4.7,
    reviews: 119,
    soldCount: 204,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 5
  },
  {
    id: "prod_34",
    slug: "glenlivet-12-founder",
    name: "The Glenlivet 12 Year Old",
    shortDescription: "Classic Speyside single malt whisky with complex tropical fruit profiles.",
    longDescription: "Representing The Glenlivet's signature style, this classic malt is matured primarily in traditional European oak before finishing in American oak barrels.",
    category: "spirits",
    tags: ["Single Malt", "Express Delivery"],
    variants: [
      { id: "sm", label: "70cl", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b4666?auto=format&fit=crop&w=600&q=80", price: 71000, stockLeft: 15 }
    ],
    rating: 4.6,
    reviews: 130,
    soldCount: 240,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 8
  },
  {
    id: "prod_35",
    slug: "baileys-original-cream",
    name: "Baileys Original Irish Cream",
    shortDescription: "The ultimate sweet indulgence, combining fine Irish whiskey and real cream.",
    longDescription: "A sweet mix of dairy cream, Irish whiskey, and chocolate flavors. Best served over cubed ice, mixed into coffee, or used as a dessert topping.",
    category: "spirits",
    tags: ["Express Delivery", "Liqueur", "Best Seller", "Sweet Wine"],
    variants: [
      { id: "sm", label: "70cl", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 24000, stockLeft: 60 },
      { id: "lg", label: "1L", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 31000, stockLeft: 40 }
    ],
    rating: 4.8,
    reviews: 388,
    soldCount: 940,
    liked: false,
    featured: true,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 15
  },
  {
    id: "prod_36",
    slug: "jagermeister-liqueur",
    name: "Jägermeister Herbal Liqueur",
    shortDescription: "An iconic German herbal liqueur crafted from 56 secret botanicals.",
    longDescription: "Best kept frozen in the icebox and served ice cold as a party shot. Features deep herbal notes, spice, and natural fruit extracts.",
    category: "spirits",
    tags: ["Express Delivery", "Party Favorite", "Best Seller"],
    variants: [
      { id: "sm", label: "70cl", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 22000, stockLeft: 25 },
      { id: "lg", label: "1L", image: "https://images.unsplash.com/photo-1527281400828-ac3fe76b0041?auto=format&fit=crop&w=600&q=80", price: 29500, stockLeft: 18 }
    ],
    rating: 4.7,
    reviews: 245,
    soldCount: 512,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 5
  },

  // --- NEW ADDED PREMIUM PRODUCTS (37 to 42) ---
  {
    id: "prod_37",
    slug: "kitchenaid-stand-mixer",
    name: "KitchenAid Artisan Stand Mixer",
    shortDescription: "Legendary culinary mixer with detailed multi-speed planetary action.",
    longDescription: "The ultimate centerpiece appliance for bakeries and home kitchens alike. Built with a full robust metal construction and featuring a 4.8L stainless steel bowl configuration.",
    category: "kitchen",
    tags: ["Kitchen", "Premium Appliance", "Baker Classic"],
    variants: [
      { id: "std", label: "4.8L Bowl", image: KitchenAid_Artisan_Stand_Mixer.src, price: 320000, stockLeft: 5 }
    ],
    rating: 4.9,
    reviews: 86,
    soldCount: 144,
    liked: false,
    featured: true,
    isNew: true,
    estimatedDelivery: "1 - 2 Days",
    discountPercentage: 5
  },
  {
    id: "prod_38",
    slug: "gourmet-chocolate-cupcake-tier",
    name: "Double Chocolate Fudge Cupcakes",
    shortDescription: "Moist dark cocoa base topped with silky Belgian chocolate frosting.",
    longDescription: "Decadent pastry box built for celebrations. Handcrafted with premium single-origin cocoa fillings and fine edible gold dust spray details.",
    category: "confectioneries",
    tags: ["Freshly Baked", "Dessert Classic"],
    variants: [
      { id: "6pack", label: "Box of 6", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", price: 7500, stockLeft: 15 },
      { id: "12pack", label: "Box of 12", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", price: 14000, stockLeft: 10 }
    ],
    rating: 4.8,
    reviews: 63,
    soldCount: 215,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "2 - 4 Hours",
    discountPercentage: 0
  },
  {
    id: "prod_39",
    slug: "executive-networking-bbq",
    name: "Corporate VIP BBQ Lounge Setup",
    shortDescription: "Ultra-premium open-air live grill hosting layout for executive teams.",
    longDescription: "A full end-to-end luxury corporate environment event production package. Includes multi-station premium woodfire smokers, master pit chefs, ambient lighting, high-end seating, and sound setup.",
    category: "party-plans",
    tags: ["Party Plan", "Premium Service", "Corporate"],
    variants: [
      { id: "vip", label: "Up to 80 Guests", image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80", price: 650000, stockLeft: 2 }
    ],
    rating: 4.9,
    reviews: 24,
    soldCount: 41,
    liked: false,
    featured: true,
    isNew: true,
    estimatedDelivery: "72 Hours Notice",
    discountPercentage: 10
  },
  {
    id: "prod_40",
    slug: "anova-sous-vide-cooker",
    name: "Anova Precision Sous Vide Cooker",
    shortDescription: "Immersion circulator cooker with perfect temperature control technology.",
    longDescription: "Achieve restaurant-quality cooking at home. Delivers exact temperature circulation metrics to prevent overcooking or drying out premium meats, poultry, and vegetables.",
    category: "kitchen",
    tags: ["Kitchen", "New Tech"],
    variants: [
      { id: "wifi", label: "Pro Wi-Fi", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80", price: 95000, stockLeft: 8 }
    ],
    rating: 4.7,
    reviews: 41,
    soldCount: 112,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "1 - 2 Days",
    discountPercentage: 5
  },
  {
    id: "prod_41",
    slug: "veuve-clicquot-rose",
    name: "Veuve Clicquot Rose Champagne",
    shortDescription: "Radiant luxury rose champagne with intense red fruit aromatics.",
    longDescription: "An exceptional expression combining structured Pinot Noir depth with the fresh elegance of classic Chardonnay notes. Highly sought after for premier events.",
    category: "wines",
    tags: ["Express Delivery", "Luxury", "Popular"],
    variants: [
      { id: "std", label: "750ml", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80", price: 110000, stockLeft: 7 }
    ],
    rating: 4.8,
    reviews: 92,
    soldCount: 153,
    liked: false,
    featured: true,
    isNew: true,
    estimatedDelivery: "1 - 3 Hours",
    discountPercentage: 8
  },
  {
    id: "prod_42",
    slug: "premium-ny-cheesecake",
    name: "Classic New York Vanilla Cheesecake",
    shortDescription: "Decadent cream cheese filling over a buttery graham cracker crust.",
    longDescription: "Rich, dense, and perfectly smooth baked gourmet dessert setup. Finished with a light vanilla bean sour cream glaze topper, built for birthday events.",
    category: "confectioneries",
    tags: ["Freshly Baked", "Dessert Classic"],
    variants: [
      { id: "lg", label: "Large 10-Inch", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", price: 28000, stockLeft: 6 }
    ],
    rating: 4.7,
    reviews: 58,
    soldCount: 129,
    liked: false,
    featured: false,
    isNew: false,
    estimatedDelivery: "2 - 5 Hours",
    discountPercentage: 12
  }
];