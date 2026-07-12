

import type {
  HubGroup,
  HubSlideItem,
  HubWidget,
} from "@/components/discovery-hub-panel/discoveryHubTypes";

export const hubGroups: HubGroup[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    description: 'Overview of your experience',
    order: 1
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: 'shopping',
    description: 'Cart, wishlist and product activity',
    order: 2
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: 'orders',
    description: 'Deliveries and order activity',
    order: 3
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: 'rewards',
    description: 'Points, coupons and membership benefits',
    order: 4
  },
  {
    id: 'ai',
    label: 'AI',
    icon: 'ai',
    description: 'Smart suggestions and personal guidance',
    order: 5
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    description: 'Control your hub preferences',
    order: 6
  }
];


const champagneSlides: HubSlideItem[] = [
  {
    id: "prod_1",
    title: "Moët Imperial",
    subtitle: "Champagne Brut",
    image: "/products/moet-chandon-imperial_lg.jpg",
    price: 65000,
    badge: "Popular",
  },
  {
    id: "prod_2",
    title: "Dom Pérignon",
    subtitle: "Vintage 2013",
    image: "/products/DomPérignon_lg.jpg",
    price: 225000,
    badge: "Luxury",
  },
  {
    id: "prod_3",
    title: "Moët Nectar",
    subtitle: "Rich & vibrant",
    image: "/products/moetchandonnectar_lg.jpg",
    price: 72000,
    badge: "Sweet",
  },
];

const spiritSlides: HubSlideItem[] = [
  {
    id: "prod_4",
    title: "Hennessy VSOP",
    subtitle: "Cognac",
    image: "/products/hennessy_lg.jpg",
    price: 85000,
  },
  {
    id: "prod_5",
    title: "Jack Daniel’s",
    subtitle: "Whiskey",
    image: "/products/jackdaniels_lg.jpg",
    price: 24000,
  },
  {
    id: "prod_6",
    title: "Martell Blue Swift",
    subtitle: "Cognac spirit",
    image: "/products/martellblue_lg.jpg",
    price: 92000,
  },
];

export const hubWidgets: HubWidget[] = [
  {
    id: "home-deals",
    groupId: "home",
    layout: "hero",
    title: "Today’s Deals",
    description: "Hot offers picked for your next celebration.",
    order: 0,
    enabled: true,
    status: "warning",
    badge: "Hot",
    meta: "Deals",
    autoSlide: true,
    slides: [
      {
        id: "deal_1",
        title: "Weekend Discount",
        subtitle: "Save 20% on selected premium drinks",
        image: "/products/moet-chandon-imperial_lg.jpg",
        badge: "20% OFF",
      },
      {
        id: "deal_2",
        title: "Luxury Night Picks",
        subtitle: "Dom Pérignon, Moët Nectar and more",
        image: "/products/DomPérignon_lg.jpg",
        badge: "Premium",
      },
      {
        id: "deal_3",
        title: "Party Ready",
        subtitle: "Fast-moving spirits for the weekend",
        image: "/products/jackdaniels_lg.jpg",
        badge: "Trending",
      },
    ],
    action: { label: "Explore deals", href: "/store?category=deals" },
  },

  {
    id: "cart-summary",
    groupId: "home",
    layout: "slider",
    title: "Cart Summary",
    description: "Your current cart is ready for checkout.",
    order: 1,
    enabled: true,
    status: "active",
    badge: "3 items",
    meta: "Cart",
    stats: [
      { label: "Subtotal", value: "₦174,000" },
      { label: "Delivery", value: "Today", helper: "2:30 PM - 4:30 PM" },
    ],
    slides: champagneSlides,
    insight: "Spend ₦20,000 more to unlock free delivery.",
    action: { label: "View cart", href: "/cart" },
  },

  {
    id: "delivery-tracker",
    groupId: "home",
    layout: "tracking",
    slides: champagneSlides,
    location: {
      title: "Driver is near GRA Junction",
      subtitle: "3.4km away from delivery address",
      coordinates: {
        lat: 6.5244,
    lng: 3.3792,
  },
},
    title: "Delivery Tracker",
    description: "Your AJ Logik order is currently on the way.",
    order: 2,
    enabled: true,
    status: "success",
    badge: "18 min",
    meta: "Live Order",
    stats: [
      { label: "ETA", value: "18 mins" },
      { label: "Order", value: "#AJ-0248" },
    ],
    progress: {
      label: "Delivery progress",
      value: 72,
      helper: "Picked up • On the way",
    },
    timeline: [
      { id: "t1", label: "Confirmed", completed: true, time: "12:05 PM" },
      { id: "t2", label: "Packed", completed: true, time: "12:42 PM" },
      { id: "t3", label: "On the way", active: true, time: "1:18 PM" },
      { id: "t4", label: "Delivered", completed: false },
    ],
    conditions: [
      { label: "Traffic", value: "Light" },
      { label: "Weather", value: "Clear" },
      { label: "Distance", value: "3.4km" },
    ],
    action: { label: "Track live", href: "/orders" },
  },

  {
    id: "rewards-summary",
    groupId: "home",
    layout: "summary",
    title: "Rewards",
    description: "Gold member benefits are active.",
    order: 3,
    enabled: true,
    status: "active",
    badge: "Gold",
    meta: "Membership",
    stats: [
      { label: "Points", value: "2,540" },
      { label: "Expiring", value: "120 pts", helper: "in 4 days" },
    ],
    progress: {
      label: "To Platinum",
      value: 82,
      helper: "460 points remaining",
    },
    action: { label: "View rewards", href: "/rewards" },
  },

  {
    id: "wishlist-alert",
    groupId: "home",
    layout: "grid",
    title: "Wishlist Alert",
    description: "Some saved products are back in stock.",
    order: 4,
    enabled: true,
    status: "warning",
    badge: "4 saved",
    meta: "Wishlist",
    slides: spiritSlides,
    insight: "2 wishlist items are now available for delivery.",
    action: { label: "Open wishlist", href: "/wishlist" },
  },

  {
    id: "continue-shopping",
    groupId: "shopping",
    layout: "slider",
    title: "Continue Shopping",
    description: "Pick up exactly where you stopped.",
    order: 1,
    enabled: true,
    status: "active",
    meta: "Last viewed",
    slides: champagneSlides,
    action: { label: "Continue", href: "/store" },
  },
  {
    id: "recently-viewed",
    groupId: "shopping",
    layout: "grid",
    title: "Recently Viewed",
    description: "Products you checked recently.",
    order: 2,
    enabled: true,
    meta: "Shopping",
    slides: [...champagneSlides, ...spiritSlides].slice(0, 4),
    action: { label: "View all", href: "/store" },
  },
  {
    id: "suggested-picks",
    groupId: "shopping",
    layout: "minimal-grid",
    title: "Suggested Picks",
    description: "Based on your browsing and taste.",
    order: 3,
    enabled: true,
    status: "active",
    meta: "For you",
    slides: spiritSlides,
    insight: "Your recent activity leans toward premium cognac and champagne.",
  },
  {
    id: "new-products",
    groupId: "shopping",
    layout: "minimal-grid",
    title: "New Products",
    description: "Fresh arrivals added this week.",
    order: 4,
    enabled: true,
    badge: "New",
    meta: "Fresh",
    slides: [
      ...spiritSlides.slice(0, 2),
      ...champagneSlides.slice(1, 2),
    ],
  },
  {
    id: "wishlisted-products",
    groupId: "shopping",
    layout: "grid",
    title: "Wishlisted",
    description: "Saved products you may want to revisit.",
    order: 5,
    enabled: true,
    status: "warning",
    badge: "4 saved",
    meta: "Saved",
    slides: spiritSlides,
  },
  {
    id: "shopping-promos",
    groupId: "shopping",
    layout: "hero",
    title: "Promos",
    description: "Promotions connected to your interests.",
    order: 6,
    enabled: true,
    status: "warning",
    badge: "Limited",
    meta: "Promos",
    autoSlide: true,
    slides: champagneSlides,
  },

  {
    id: "recent-orders",
    groupId: "orders",
    layout: "grid",
    title: "Recent Orders",
    description: "Your latest AJ Logik order activity.",
    order: 1,
    enabled: true,
    meta: "Orders",
    stats: [
      { label: "Completed", value: 8 },
      { label: "Active", value: 1 },
    ],
    slides: champagneSlides,
    action: { label: "View orders", href: "/orders" },
  },
  {
    id: "active-delivery",
    groupId: "orders",
    layout: "tracking",
    title: "Active Delivery",
    description: "One order is currently on the way.",
    order: 2,
    enabled: true,
    status: "success",
    badge: "Live",
    meta: "Tracker",
    location: {
      title: "Driver approaching delivery area",
      subtitle: "Estimated arrival: 18 minutes",
      coordinates: {
        lat: 6.5244,
        lng: 3.3792,
      },
    },
    progress: { label: "Route completed", value: 72 },
    timeline: [
      { id: "od1", label: "Order confirmed", completed: true },
      { id: "od2", label: "Packed", completed: true },
      { id: "od3", label: "Out for delivery", active: true },
      { id: "od4", label: "Delivered" },
    ],
    conditions: [
      { label: "Traffic", value: "Light" },
      { label: "Distance", value: "3.4km" },
      { label: "ETA", value: "18 mins" },
    ],
    action: { label: "Track order", href: "/orders" },
  },

 {
  id: "reward-points",
  groupId: "rewards",
  layout: "membership", // <-- new layout
  title: "Reward Points",
  description: "Your loyalty balance is growing.",
  order: 1,
  enabled: true,
  status: "success",
  badge: "Gold",
  meta: "Rewards",

  // Remove this
  // accent: "from-amber-500/20 to-yellow-300/10",

  stats: [
    { label: "Balance", value: "2,540" },
    { label: "Coupons", value: 3 },
  ],

  progress: {
    label: "Gold to Platinum",
    value: 82,
    helper: "460 pts remaining",
  },

  insight:
    "Maintain your shopping streak this week to earn bonus loyalty points.",

  action: {
    label: "Explore benefits",
    href: "/rewards",
  },
},
  {
    id: "coupons",
    groupId: "rewards",
    layout: "hero",
    title: "Coupons",
    description: "Available discounts and offers.",
    order: 2,
    enabled: true,
    status: "warning",
    badge: "3 active",
    meta: "Coupons",
    slides: [
      { id: "cp1", title: "Free Delivery", subtitle: "Valid this weekend", image: "/products/moetchandonnectar_lg.jpg", badge: "Active" },
      { id: "cp2", title: "₦10,000 Off", subtitle: "Premium champagne orders", image: "/products/DomPérignon_lg.jpg", badge: "Gold" },
      { id: "cp3", title: "Party Pack Bonus", subtitle: "For large orders", image: "/products/jackdaniels_lg.jpg", badge: "Bonus" },
    ],
  },

  {
    id: "ai-suggestions",
    groupId: "ai",
    layout: "grid",
    title: "AJ AI Suggestions",
    description: "Smart picks based on your taste.",
    order: 1,
    enabled: true,
    status: "active",
    badge: "Smart",
    meta: "AI picked",
    slides: champagneSlides,
    insight: "Tonight’s mood looks like premium champagne with sweet pairings.",
    action: { label: "Ask AJ AI", href: "/ai" },
  },
  {
    id: "pairing-assistant",
    groupId: "ai",
    layout: "minimal-grid",
    title: "Pairing Assistant",
    description: "Perfect drink and treat combinations.",
    order: 2,
    enabled: true,
    meta: "Pairing",
    slides: [
      { id: "pair_1", title: "Moët Nectar", subtitle: "Pairs with chocolate truffles", image: "/products/moetchandonnectar_lg.jpg", badge: "Sweet" },
      { id: "pair_2", title: "Hennessy VSOP", subtitle: "Pairs with grilled meals", image: "/products/hennessy_lg.jpg", badge: "Bold" },
      { id: "pair_3", title: "Dom Pérignon", subtitle: "Pairs with luxury desserts", image: "/products/DomPérignon_lg.jpg", badge: "Luxury" },
    ],
  },

  {
    id: "hub-settings",
    groupId: "settings",
    layout: "summary",
    title: "Hub Settings",
    description: "Customize your Discovery Hub.",
    order: 1,
    enabled: true,
    meta: "Preferences",
    stats: [
      { label: "Widgets", value: "12 active" },
      { label: "Mode", value: "Personalized" },
    ],
    action: { label: "Customize", href: "/settings" },
  },
  {
    id: "notification-settings",
    groupId: "settings",
    layout: "summary",
    title: "Notifications",
    description: "Manage alerts, delivery updates, and offers.",
    order: 2,
    enabled: true,
    meta: "Alerts",
    stats: [
      { label: "Push", value: "Enabled" },
      { label: "Deals", value: "On" },
    ],
    action: { label: "Manage", href: "/settings/notifications" },
  },
];