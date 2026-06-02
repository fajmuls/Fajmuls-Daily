import * as LucideIcons from "lucide-react";
import { Tag, TrendingUp, TrendingDown } from "lucide-react";

export const AVAILABLE_ICONS = [
  "Utensils", "Coffee", "Pizza", "Sandwich", "Beer", "Fuel", "ShoppingBag", "Smartphone", "Zap", "Droplet", "Wifi", "Tag", "Wallet", "CreditCard", "Home", "Car", "Bus", "Plane", "Train", "Bike", "MapPin", "User", "Heart", "Star", "Camera", "Film", "Tv", "Music", "Gamepad", "Laptop", "Headphones", "Gift", "PartyPopper", "Sprout", "Stethoscope", "Pill", "Palette", "Cloud", "Sun", "Moon", "Bell", "Ticket", "Globe", "Book", "Briefcase", "Dumbbell", "Shield", "Search", "PenTool", "Scissors", "Shirt", "Video", "Mic", "Printer", "Compass", "Key", "Activity", "BookOpen", "Box", "Feather", "Flag", "Map", "Package", "Smile", "Watch", "Thermometer", "Umbrella", "Wine", "CupSoda", "Bed", "Anchor", "Cat", "Dog", "Fish", "Bone", "Ghost", "Bug", "Rocket", "PlaneTakeoff", "Apple", "Carrot", "Egg", "Trophy", "Award", "Medal", "Crown", "Coins", "Banknote", "Percent", "Receipt", "Calculator", "PiggyBank", "Wrench", "Hammer", "Drill", "Screwdriver",
];

export const CATEGORY_TO_ICON: Record<string, string> = {
  Makanan: "Utensils",
  Makan: "Utensils",
  Jajan: "Coffee",
  BBM: "Fuel",
  "BBM dan parkir": "Fuel",
  Belanja: "ShoppingBag",
  "Belanja online": "ShoppingBag",
  Pulsa: "Smartphone",
  Sosial: "Heart",
  Investasi: "TrendingUp",
  "Investasi kripto": "TrendingUp",
  Gaji: "Wallet",
  "Gaji harian": "Wallet",
  Indomilk: "Milk",
  Hadiah: "Gift",
  Berbagi: "HandHeart",
  Bepergian: "Car",
  Transportasi: "Car",
  Tagihan: "Zap",
  Pendidikan: "Pencil",
  Olahraga: "Dumbbell",
  Rekreasi: "Plane",
  "Bikin sesuatu": "Wrench",
  Umi: "Heart",
  Mempercantik: "Sparkles",
  Bengkel: "Settings",
  Kesehatan: "Stethoscope",
  Obat: "Pill",
  Hiburan: "Gamepad2",
  Listrik: "Zap",
  Air: "Droplet",
  Internet: "Wifi",
};

export const getCategoryColor = (catName: string, catType: "income" | "expense", prefs: any = {}) => {
  if (prefs[catName]?.color) return prefs[catName].color;
  const COLORS_EXPENSE = ["#FF4500", "#D81B60", "#8E24AA", "#1E88E5", "#00897B", "#43A047", "#E53935", "#3949AB"];
  const COLORS_INCOME = ["#00C853", "#2962FF", "#FFAB00", "#C51162", "#00BFA5", "#FF6D00", "#6200EA", "#AEEA00"];
  const colors = catType === "income" ? COLORS_INCOME : COLORS_EXPENSE;
  let hash = 0;
  for (let i = 0; i < catName.length; i++) {
    hash = catName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const getCategoryIcon = (catName: string, catType: "income" | "expense", prefs: any = {}) => {
  if (prefs[catName]?.iconName) return prefs[catName].iconName;
  return CATEGORY_TO_ICON[catName] || (catType === "income" ? "TrendingUp" : "TrendingDown");
};
