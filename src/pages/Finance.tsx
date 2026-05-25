import React, { useState, FormEvent, useMemo, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { ICON_GROUPS } from "../data";
import { format, isSameDay, startOfMonth, subMonths, subYears, isAfter } from "date-fns";
import { id } from "date-fns/locale";
import { useAppContext } from "../store";
import { FinanceRecord } from "../types";
import {

  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Tag,
  Save,
  Settings,
  Eye,
  EyeOff,
  X,
  Wallet,
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  BarChart3,
  ListFilter,
  CheckCircle2,
  Download,
  Sparkles,
  MessageSquare,
  Utensils,
  Coffee,
  Fuel,
  ShoppingBag,
  Smartphone,
  Heart,
  TrendingDown,
  Gift,
  Milk,
  HandHeart,
  Car,
  Lightbulb,
  MoreHorizontal,
  LucideIcon,
  Zap,
  Droplet,
  Smartphone as Phone,
  Stethoscope,
  Pill,
  Gamepad2,
  Wifi,
  Pizza,
  Sandwich,
  Coffee as CoffeeIcon,
  ShoppingBag as Bag,
  Beer,
  Music,
  Tv,
  Film,
  Camera,
  Book,
  GraduationCap,
  Briefcase,
  Home,
  Bus,
  Plane,
  Train,
  Bike,
  Globe,
  Dumbbell,
  Gamepad,
  Ticket,
  Scissors,
  Brush,
  Palette,
  Cloud,
  Sun,
  Moon,
  Star as StarIcon,
  Search,
  Bell,
  Mail,
  User,
  Users,
  Settings as SettingsIcon,
  Trash,
  Check,
  ChevronRight,
  ChevronUp,
  Folder,
  Calculator,
  Edit3
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "../lib/utils";
import { useAudio } from "../hooks/useAudio";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

import { WorkspaceSyncModal } from "../components/WorkspaceSyncModal";
import { ActionMenu } from "../components/ActionMenu";
import { AddFinanceModal } from "../components/AddFinanceModal";

const AVAILABLE_ICONS = [
  "Utensils", "Coffee", "Pizza", "Sandwich", "Beer", "Fuel", "ShoppingBag", "Smartphone", "Zap", "Droplet", "Wifi", "Tag", "Wallet", "CreditCard", "Home", "Car", "Bus", "Plane", "Train", "Bike", "MapPin", "User", "Heart", "Star", "Camera", "Film", "Tv", "Music", "Gamepad", "Laptop", "Headphones", "Gift", "PartyPopper", "Sprout", "Stethoscope", "Pill", "Palette", "Cloud", "Sun", "Moon", "Bell", "Ticket", "Globe", "Book", "Briefcase", "Dumbbell", "Shield", "Search", "PenTool", "Scissors", "Shirt", "Video", "Mic", "Printer", "Compass", "Key", "Activity", "BookOpen", "Box", "Feather", "Flag", "Map", "Package", "Smile", "Watch", "Thermometer", "Umbrella", "Wine", "CupSoda", "Bed", "Anchor", "Cat", "Dog", "Fish", "Bone", "Ghost", "Bug", "Rocket", "PlaneTakeoff", "Apple", "Carrot", "Egg", "Trophy", "Award", "Medal", "Crown", "Coins", "Banknote", "Percent", "Receipt", "Calculator", "PiggyBank", "Wrench", "Hammer", "Drill", "Screwdriver"
];

function CustomDropdown({ value, options, onChange, icon }: { value: string, options: { value: string, label: string, iconComponent?: React.ReactNode }[], onChange: (val: string) => void, icon?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative flex-1 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-paper border border-stone-200 rounded-2xl p-4 px-4 md:px-6 flex items-center justify-between shadow-sm hover:border-stone-400 transition-all font-bold text-xs md:text-sm text-stone-700"
      >
        <div className="flex items-center gap-3">
          {selected.iconComponent ? <span className="text-stone-400">{selected.iconComponent}</span> : icon && <span className="text-stone-400">{icon}</span>}
          <span>{selected.label}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-3xl shadow-2xl z-50 p-2 max-h-60 overflow-y-auto"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors",
                    value === opt.value ? "bg-stone-900 text-white" : "hover:bg-stone-50 text-stone-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                     {opt.iconComponent && <span className={cn(value === opt.value ? "text-stone-300" : "text-stone-400")}>{opt.iconComponent}</span>}
                     <span className="font-bold text-sm">{opt.label}</span>
                  </div>
                  {value === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Finance() {
  const {
    financeRecords,
    addFinanceRecord,
    addFinanceRecordsBulk,
    deleteFinanceRecord,
    showConfirm,
    financeMappings,
    updateFinanceMapping,
    deleteFinanceMapping,
    hideAmounts,
    setHideAmounts,
    setAlert,
    financeCategoryPrefs,
    updateCategoryPref,
    updateFinanceCategoryBulk,
    updateFinanceRecord,
    budgets,
    addBudget,
    deleteBudget,
    savings,
    addSaving,
    updateSaving,
    deleteSaving,
    darkMode,
    setDarkMode
  } = useAppContext();
  const { playSuccess, playError, playClick } = useAudio();

  const [activeTab, setActiveTab] = useState<"records" | "analysis" | "settings" | "planning">("records");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [chartMode, setChartMode] = useState<"detail" | "grouped">("detail");
  const [showSettings, setShowSettings] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [addRecordDate, setAddRecordDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("Tag");
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<{oldName: string; newName: string; type: "income" | "expense"; iconName: string; color: string} | null>(null);

  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  
  const handleChartClick = (data: any, type: 'expense' | 'income') => {
    if(data?.payload?.name) {
      let targetName = data.payload.name;
      const originalData = type === 'expense' ? expenseData : incomeData;
      
      // If clicking "Lainnya", find the first category in Lainnya
      if (targetName === "Lainnya") {
        const others = originalData.filter(d => parseFloat(d.displayPercent) < 3);
        if (others.length > 0) {
          // Highlight all categories in "Lainnya" or just scroll to the first one
          // The user said: "Yang disorot adalah yang sudah dikelompokkan ke dalam lainnya."
          // We'll set a special state to highlight all of them
          setHighlightedCategory("Lainnya");
          const el = document.getElementById(`detail-${type}-Lainnya-Header`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => setHighlightedCategory(null), 5000);
          return;
        }
      }
      
      const el = document.getElementById(`detail-${type}-${targetName}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedCategory(targetName);
        setTimeout(() => setHighlightedCategory(null), 3000);
      }
    }
  };

  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterRange, setFilterRange] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  
  const [selectedSlice, setSelectedSlice] = useState<any>(null);
  const [showCalc, setShowCalc] = useState(false);
  const [calcValue, setCalcValue] = useState("");
  
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const toggleDateExpansion = (date: number) => {
    const key = format(date, 'yyyy-MM-dd');
    setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Group mappings management
  const [newGroupCategory, setNewGroupCategory] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [managedGroup, setManagedGroup] = useState<string | null>(null);

  const [categoryEdits, setCategoryEdits] = useState<Record<string, {name: string, iconName: string, color: string}>>({});
  const [pickingIconFor, setPickingIconFor] = useState<string | null>(null);
  
  const getCatEdit = (cat: string, isIncome: boolean) => {
    if (categoryEdits[cat]) return categoryEdits[cat];
    const fpColor = getCategoryColor(cat, isIncome ? 'income' : 'expense');
    return {
      name: cat,
      iconName: financeCategoryPrefs[cat]?.iconName || categoryToIcon[cat] || (isIncome ? 'TrendingUp' : 'TrendingDown'),
      color: financeCategoryPrefs[cat]?.color || fpColor
    };
  };

  // Memoized category to group map for easy lookup
  const categoryToGroup = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(financeMappings as Record<string, string[]>).forEach(([group, cats]) => {
      cats.forEach(cat => {
        map[cat] = group;
      });
    });
    return map;
  }, [financeMappings]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    financeRecords.forEach((r) => set.add(r.category));
    return Array.from(set).sort();
  }, [financeRecords]);

  const filteredRecords = useMemo(() => {
    let records = [...financeRecords];

    // Filter by Range
    const now = new Date();
    if (filterRange === "current_month") {
      const start = startOfMonth(now);
      records = records.filter(r => isAfter(new Date(r.createdAt), start));
    } else if (filterRange === "this_week") {
      const currentDay = now.getDay();
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      const start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      records = records.filter(r => new Date(r.createdAt).getTime() >= start.getTime());
    } else if (filterRange === "last_month") {
      const start = startOfMonth(subMonths(now, 1));
      const end = startOfMonth(now);
      records = records.filter(r => isAfter(new Date(r.createdAt), start) && !isAfter(new Date(r.createdAt), end));
    } else if (filterRange === "last_year") {
      const start = subYears(now, 1);
      records = records.filter(r => isAfter(new Date(r.createdAt), start));
    } else if (filterRange === "last_2_years") {
      const start = subYears(now, 2);
      records = records.filter(r => isAfter(new Date(r.createdAt), start));
    } else if (filterRange === "custom") {
      const start = customStartDate ? new Date(customStartDate) : new Date(0);
      const end = customEndDate ? new Date(customEndDate) : new Date(now);
      end.setHours(23, 59, 59, 999);
      records = records.filter(r => {
        const d = new Date(r.createdAt);
        return d >= start && d <= end;
      });
    }

    // Filter by Category
    if (filterCategory !== "All") {
      records = records.filter((r) => r.category === filterCategory);
    }
    
    return records;
  }, [financeRecords, filterCategory, filterRange, customStartDate, customEndDate]);

  // Group records by date
  const groupedRecordsByDate = useMemo(() => {
    const groups: { date: number; records: FinanceRecord[] }[] = [];
    filteredRecords.forEach(record => {
      const existing = groups.find(g => isSameDay(g.date, record.createdAt));
      if (existing) {
        existing.records.push(record);
      } else {
        groups.push({ date: record.createdAt, records: [record] });
      }
    });
    return groups.sort((a, b) => b.date - a.date);
  }, [filteredRecords]);

  const categoryToIcon: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {
      "Makanan": "Utensils",
      "Makan": "Utensils",
      "Jajan": "Coffee",
      "BBM": "Fuel",
      "BBM dan parkir": "Fuel",
      "Belanja": "ShoppingBag",
      "Belanja online": "ShoppingBag",
      "Pulsa": "Smartphone",
      "Sosial": "Heart",
      "Investasi": "TrendingUp",
      "Investasi kripto": "TrendingUp",
      "Gaji": "Wallet",
      "Gaji harian": "Wallet",
      "Indomilk": "Milk",
      "Hadiah": "Gift",
      "Berbagi": "HandHeart",
      "Bepergian": "Car",
      "Transportasi": "Car",
      "Tagihan": "Zap",
      "Pendidikan": "Pencil",
      "Olahraga": "Dumbbell",
      "Rekreasi": "Plane",
      "Bikin sesuatu": "Wrench",
      "Umi": "Heart",
      "Mempercantik": "Sparkles",
      "Bengkel": "Settings",
      "Kesehatan": "Stethoscope",
      "Obat": "Pill",
      "Hiburan": "Gamepad2",
      "Listrik": "Zap",
      "Air": "Droplet",
      "Internet": "Wifi",
    };
    return map;
  }, []);

  const getDynamicIcon = (name: string | undefined, fallback: LucideIcon) => {
    if (!name) return fallback;
    const Icon = (LucideIcons as any)[name];
    return Icon || fallback;
  };

  const handleAIParsing = async () => {
    if (!aiPrompt.trim()) return;
    setIsParsing(true);
    try {
      const response = await fetch("/api/finance/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, categories: allCategories }),
      });
      const data = await response.json();
      if (data.records && data.records.length > 0) {
        const newRecords = data.records.map((r: any) => ({
          ...r,
          id: uuidv4(),
          createdAt: Date.now(),
          parentCategory: categoryToGroup[r.category] || undefined,
          // Ensure we have a valid icon
          iconName: r.iconName || (r.type === 'income' ? 'TrendingUp' : 'Tag')
        }));
        await addFinanceRecordsBulk(newRecords);
        setAiPrompt("");
        setShowAIModal(false);
        playSuccess();
        setAlert(`Berhasil menambahkan ${newRecords.length} catatan.`);
      } else {
        setAlert("Gagal memproses teks. Coba gunakan bahasa yang lebih jelas.");
      }
    } catch (e) {
      console.error(e);
      setAlert("Terjadi kesalahan sistem saat memproses.");
    } finally {
      setIsParsing(false);
    }
  };

  const dayStats = useMemo(() => {
    const today = new Date();
    const getDayTotal = (date: Date) => {
      return financeRecords
        .filter(r => isSameDay(new Date(r.createdAt), date) && r.type === "expense")
        .reduce((sum, r) => sum + r.amount, 0);
    };

    const todayTotal = getDayTotal(today);
    return { todayTotal };
  }, [financeRecords]);

  const existingGroups = useMemo(() => {
    return Object.keys(financeMappings).sort();
  }, [financeMappings]);

  // Vibrant and distinct colors for income (Bright)
  const COLORS_INCOME = [
    "#22c55e", // Green
    "#0ea5e9", // Sky
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Violet
    "#10b981", // Emerald
    "#f97316", // Orange
    "#3b82f6", // Blue
  ];

  // Distinct dark colors for expenses (Darker theme)
  const COLORS_EXPENSE = [
    "#7f1d1d", // Dark Red
    "#1e3a8a", // Dark Blue
    "#365314", // Dark Lime
    "#581c87", // Dark Purple
    "#7c2d12", // Dark Orange
    "#1c1917", // Gray 900
    "#14532d", // Dark Green
    "#450a0a", // Darker Red
  ];

  const categorySuggestions = useMemo(() => {
    const counts: Record<string, number> = {};
    financeRecords
      .filter((r) => r.type === type)
      .forEach((r) => {
        counts[r.category] = (counts[r.category] || 0) + 1;
      });

    const defaultCats =
      type === "income"
        ? ["Gaji", "Bonus", "Investasi", "Hadiah", "Freelance", "Penjualan", "Bisnis", "Subsidi", "Pencairan", "Royalti"]
        : [
            "Makanan", "Kopi & Jajan", "Transportasi Umum", "BBM", "Tagihan", "Belanja Harian", "Belanja Online", 
            "Pulsa & Data", "Listrik", "Air", "Internet", "Hiburan", "Kesehatan", "Obat", "Pakaian", 
            "Pendidikan", "Sedekah", "Sosial", "Perawatan", "Hewan Peliharaan", "Perawatan Kendaraan", "Keperluan Rumah"
          ];

    const allCatsSet = new Set([...defaultCats]);
    financeRecords
      .filter((r) => r.type === type)
      .forEach((r) => allCatsSet.add(r.category));

    return Array.from(allCatsSet).sort((a, b) => {
      const countA = counts[a] || 0;
      const countB = counts[b] || 0;
      if (countA !== countB) return countB - countA;
      return a.localeCompare(b);
    });
  }, [financeRecords, type]);

  const parentSuggestions = useMemo(() => {
    const set = new Set<string>();
    if (type === "expense") {
      ["Kebutuhan", "Hiburan", "Kesehatan", "Tabungan"].forEach((s) =>
        set.add(s),
      );
    } else {
      ["UTAMA", "Sampingan", "Pasif"].forEach((s) => set.add(s));
    }
    financeRecords
      .filter((r) => r.type === type && r.parentCategory)
      .forEach((r) => set.add(r.parentCategory!));
    return Array.from(set);
  }, [financeRecords, type]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    // Derived parent category from mappings
    const parentCategory = categoryToGroup[category] || undefined;

    addFinanceRecord({
      id: uuidv4(),
      amount: parseFloat(amount),
      category,
      parentCategory,
      note,
      type,
      createdAt: addRecordDate.getTime(),
      iconName: selectedIcon,
    });

    setAmount("");
    setCategory("");
    setNote("");
    setSelectedIcon("Tag");
    setShowAddModal(false);
    playSuccess();
  };

  const loadBulkData = () => {
    const rawData = [
      { category: "Investasi kripto", amount: 1800000, type: "expense" as const },
      { category: "BBM dan parkir", amount: 1164000, type: "expense" as const },
      { category: "Makan", amount: 829000, type: "expense" as const },
      { category: "Belanja online", amount: 828000, type: "expense" as const },
      { category: "Jajan", amount: 788200, type: "expense" as const },
      { category: "Sosial", amount: 745000, type: "expense" as const },
      { category: "Bepergian", amount: 529500, type: "expense" as const },
      { category: "Hadiah", amount: 366000, type: "expense" as const },
      { category: "Pulsa", amount: 314000, type: "expense" as const },
      { category: "Umi", amount: 235000, type: "expense" as const },
      { category: "Indomilk", amount: 179000, type: "expense" as const },
      { category: "Mempercantik", amount: 152000, type: "expense" as const },
      { category: "Bengkel", amount: 131000, type: "expense" as const },
      { category: "Berbagi", amount: 71000, type: "expense" as const },
      { category: "Pendidikan", amount: 45000, type: "expense" as const },
      { category: "Bikin sesuatu", amount: 40000, type: "expense" as const },
      { category: "Rekreasi", amount: 37500, type: "expense" as const },
      { category: "Belanja", amount: 35000, type: "expense" as const },
      { category: "Olahraga", amount: 30000, type: "expense" as const },
      { category: "Gaji harian", amount: 11000, type: "income" as const },
    ];

    const records: FinanceRecord[] = rawData.map((d, i) => ({
      id: uuidv4(),
      amount: d.amount,
      category: d.category,
      parentCategory: categoryToGroup[d.category] || undefined,
      note: "Catatan Histori",
      type: d.type,
      createdAt: Date.now() - (i * 1000), // Slightly spread out
    }));

    showConfirm(`Tambahkan ${records.length} data histori keuangan?`, () => {
       addFinanceRecordsBulk(records);
       playSuccess();
       setAlert("Data histori berhasil ditambahkan.");
    });
  };

  const totalIncome = financeRecords.reduce(
    (acc, curr) => (curr.type === "income" ? acc + curr.amount : acc),
    0,
  );
  const totalExpense = financeRecords.reduce(
    (acc, curr) => (curr.type === "expense" ? acc + curr.amount : acc),
    0,
  );
  const balance = totalIncome - totalExpense;

  const incomeData = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    filteredRecords
      .filter((r) => r.type === "income" && r.amount > 0)
      .forEach((r) => {
        // Map to group if in grouped mode
        const key =
          chartMode === "grouped"
            ? categoryToGroup[r.category] || "Lainnya"
            : r.category;
        data[key] = (data[key] || 0) + r.amount;
        total += r.amount;
      });
    return Object.entries(data)
      .map(([name, value]) => ({
        name,
        value,
        displayPercent: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords, chartMode, categoryToGroup]);

  const expenseData = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    filteredRecords
      .filter((r) => r.type === "expense" && r.amount > 0)
      .forEach((r) => {
        const key =
          chartMode === "grouped"
            ? categoryToGroup[r.category] || "Lainnya"
            : r.category;
        data[key] = (data[key] || 0) + r.amount;
        total += r.amount;
      });
    return Object.entries(data)
      .map(([name, value]) => ({
        name,
        value,
        displayPercent: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords, chartMode, categoryToGroup]);

  const expenseChartData = useMemo(() => {
    const mainData: typeof expenseData = [];
    let lainnyaValue = 0;
    let lainnyaPercent = 0;
    expenseData.forEach(item => {
      const p = parseFloat(item.displayPercent);
      if (p < 3) {
        lainnyaValue += item.value;
        lainnyaPercent += p;
      } else {
        mainData.push(item);
      }
    });
    if (lainnyaValue > 0) {
      mainData.push({
        name: "Lainnya",
        value: lainnyaValue,
        displayPercent: lainnyaPercent.toFixed(1)
      });
    }
    return mainData;
  }, [expenseData]);

  const incomeChartData = useMemo(() => {
    const mainData: typeof incomeData = [];
    let lainnyaValue = 0;
    let lainnyaPercent = 0;
    incomeData.forEach(item => {
      const p = parseFloat(item.displayPercent);
      if (p < 3) {
        lainnyaValue += item.value;
        lainnyaPercent += p;
      } else {
        mainData.push(item);
      }
    });
    if (lainnyaValue > 0) {
      mainData.push({
        name: "Lainnya",
        value: lainnyaValue,
        displayPercent: lainnyaPercent.toFixed(1)
      });
    }
    return mainData;
  }, [incomeData]);

  // Helper to get color for a category
  const getCategoryColor = (catName: string, catType: "income" | "expense") => {
    if (financeCategoryPrefs[catName]?.color) return financeCategoryPrefs[catName].color;
    const data = catType === "income" ? incomeData : expenseData;
    const colors = catType === "income" ? COLORS_INCOME : COLORS_EXPENSE;
    const index = data.findIndex((d) => d.name === catName);
    return index !== -1 ? colors[index % colors.length] : (catType === 'income' ? '#22c55e' : '#ef4444');
  };

  const getCategoryIcon = (catName: string, catType: "income" | "expense") => {
    if (financeCategoryPrefs[catName]?.iconName) return financeCategoryPrefs[catName].iconName;
    return categoryToIcon[catName] || (catType === 'income' ? 'TrendingUp' : 'TrendingDown');
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    payload,
    name
  }: any) => {
    const RADIAN = Math.PI / 180;
    // Move labels strictly outside the pie circle
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.01) return null; // Very tiny slice is hard to render clearly, but 1% is okay

    const actualName = payload?.payload?.name || name || payload?.name;
    const isExpense = expenseData.some(d => d.name === actualName);
    const catType = isExpense ? 'expense' : 'income';
    const prefIcon = financeCategoryPrefs[actualName]?.iconName || categoryToIcon[actualName] || (catType === 'income' ? 'TrendingUp' : 'TrendingDown');
    const color = financeCategoryPrefs[actualName]?.color || getCategoryColor(actualName, catType);
    const IconProps = (LucideIcons as any)[prefIcon] || (catType === 'income' ? TrendingUp : TrendingDown);

    return (
      <g className="pointer-events-none">
        <foreignObject x={x - 14} y={y - 14} width={28} height={28}>
           <div 
             className="flex items-center justify-center bg-paper rounded-full w-full h-full border border-stone-200 shadow-sm"
             style={{ color }}
           >
              <IconProps className="w-4 h-4" />
           </div>
        </foreignObject>
        <text
          x={x}
          y={y + 24}
          fill="currentColor"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="900"
          className="drop-shadow-sm font-sans tracking-widest text-stone-500"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-lg text-sm border border-stone-700">
          <p className="font-bold mb-1 flex items-center gap-2">
            <Tag className="w-3 h-3" /> {data.name}
          </p>
          <p className="font-bold tracking-tight">Rp {data.value.toLocaleString("id-ID")}</p>
          <p className="text-stone-400 text-xs mt-1">
            {data.displayPercent}% dari total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg ring-4 ring-stone-100">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Catatan Keuangan
            </h1>
            <p className="text-stone-500 text-sm font-medium">
              Manajemen keuangan mandiri.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="bg-stone-100 p-1 rounded-2xl flex flex-wrap">
              <button 
                onClick={() => { setActiveTab('records'); playClick(); }}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all",
                  activeTab === 'records' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                )}
              >
                <ListFilter className="w-4 h-4" /> Pencatatan
              </button>
              <button 
                onClick={() => { setActiveTab('analysis'); playClick(); }}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all",
                  activeTab === 'analysis' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                )}
              >
                <BarChart3 className="w-4 h-4" /> Analisis
              </button>
              <button 
                onClick={() => { setActiveTab('planning'); playClick(); }}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all",
                  activeTab === 'planning' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                )}
              >
                <TrendingUp className="w-4 h-4" /> Perencanaan
              </button>
              <button 
                onClick={() => { setActiveTab('settings'); playClick(); }}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all",
                  activeTab === 'settings' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                )}
              >
                <Settings className="w-4 h-4" /> Kategori & Grup
              </button>
           </div>
           
           <ActionMenu items={[
             { label: "AI Input Finance", icon: <Sparkles className="w-4 h-4" />, onClick: () => setShowAIModal(true) },
             { label: "Ekspor Akun Workspace", icon: <Download className="w-4 h-4" />, onClick: () => setShowSyncModal(true) },
             { label: "Load Data Histori", icon: <CheckCircle2 className="w-4 h-4" />, onClick: loadBulkData },
             { label: hideAmounts ? "Tampilkan Saldo" : "Sembunyi Saldo", icon: hideAmounts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />, onClick: () => { setHideAmounts(!hideAmounts); playClick(); } },
           ]} />
        </div>
      </header>

      {activeTab === 'records' ? (
        <div className="space-y-8">
          <div className="w-full">
            <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-6 opacity-10 scale-150 rotate-12 transition-transform group-hover:rotate-0">
                <Wallet className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <p className="text-stone-400 uppercase tracking-widest text-[10px] font-bold mt-2">
                  Saldo Tersedia
                </p>
                <div className="flex gap-2">
                   <div className="p-1 px-4 bg-white/10 rounded-2xl flex items-center gap-2 backdrop-blur-sm">
                      <div className={cn("w-2 h-2 rounded-full", balance >= 0 ? "bg-green-400" : "bg-red-400 animate-pulse")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{balance >= 0 ? 'Surplus' : 'Defisit'}</span>
                   </div>
                   <button 
                     onClick={() => { setHideAmounts(!hideAmounts); playClick(); }}
                     className="p-3 bg-white text-stone-900 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all ring-4 ring-white/5"
                     title={hideAmounts ? "Tampilkan Saldo" : "Sembunyi Saldo"}
                   >
                     {hideAmounts ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                   </button>
                </div>
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-8 relative z-10">
                {hideAmounts ? "Rp •••••••" : `Rp ${balance.toLocaleString("id-ID")}`}
              </h2>

              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <div>
                   <div className="text-stone-400 text-[10px] uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
                     <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center"><TrendingUp className="w-2.5 h-2.5 text-green-400" /></div> Pemasukan
                   </div>
                   <p className="font-bold text-sm text-green-400">{hideAmounts ? "Rp •••" : `Rp ${totalIncome.toLocaleString('id-ID')}`}</p>
                </div>
                <div className="text-right">
                   <div className="text-stone-400 text-[10px] uppercase font-black tracking-widest mb-1 flex items-center justify-end gap-1.5">
                     Pengeluaran <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center"><TrendingDown className="w-2.5 h-2.5 text-red-400" /></div>
                   </div>
                   <p className="font-bold text-sm text-red-400">{hideAmounts ? "Rp •••" : `Rp ${totalExpense.toLocaleString('id-ID')}`}</p>
                </div>
              </div>
            </div>

            {false && <form
              onSubmit={handleSubmit}
              className="bg-paper rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5"
            >
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Plus className="w-4 h-4 p-0.5 bg-stone-900 text-white rounded-full" />
                Tambah Baru
              </h3>

              <div className="flex gap-2 p-1 bg-stone-50 rounded-2xl border border-stone-100">
                <button
                  type="button"
                  onClick={() => { setType("expense"); setCategory(""); playClick(); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all",
                    type === "expense" ? "bg-red-600 text-white shadow-lg shadow-red-200" : "text-stone-400 hover:text-stone-600"
                  )}
                >
                  <Minus className="w-4 h-4" /> Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => { setType("income"); setCategory(""); playClick(); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all",
                    type === "income" ? "bg-green-600 text-white shadow-lg shadow-green-200" : "text-stone-400 hover:text-stone-600"
                  )}
                >
                  <Plus className="w-4 h-4" /> Pemasukan
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Jumlah</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-black text-sm">Rp</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-4 focus:ring-stone-900/5 text-xl font-bold tracking-tight transition-all"
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCalcValue(amount || "0");
                        setShowCalc(!showCalc);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-stone-200 rounded-xl transition-all text-stone-500"
                    >
                      <Calculator className="w-5 h-5" />
                    </button>
                    
                    {showCalc && (
                      <div className="absolute top-full right-0 mt-2 p-4 bg-white border border-stone-200 rounded-3xl shadow-xl z-50 w-64 animate-in fade-in slide-in-from-top-2">
                         <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Kalkulator Mini</span>
                           <button onClick={() => setShowCalc(false)} className="text-stone-400 hover:text-stone-900"><X className="w-4 h-4"/></button>
                         </div>
                         <input 
                           type="text" 
                           value={calcValue}
                           readOnly
                           className="w-full bg-stone-50 rounded-xl p-3 text-right text-xl font-bold tracking-tight mb-4 focus:outline-none"
                         />
                         <div className="grid grid-cols-4 gap-2">
                           {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','.','+'].map(btn => (
                             <button
                               type="button"
                               key={btn}
                               onClick={() => {
                                 if (btn === 'C') setCalcValue('0');
                                 else {
                                    setCalcValue(prev => prev === '0' ? btn : prev + btn);
                                 }
                               }}
                               className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl font-bold text-lg transition-colors border border-stone-100"
                             >
                               {btn}
                             </button>
                           ))}
                           <button
                             type="button"
                             onClick={() => {
                               try {
                                 // Basic evaluation using Function is safe here since it's local isolated input from buttons above
                                 // eslint-disable-next-line no-new-func
                                 const val = new Function('return ' + calcValue)();
                                 if (Number.isFinite(val)) {
                                   setAmount(val.toString());
                                   setShowCalc(false);
                                 }
                               } catch (e) {
                                  // ignore invalid expr
                               }
                             }}
                             className="col-span-4 p-3 bg-stone-900 text-white rounded-xl font-bold transition-transform active:scale-[0.98]"
                           >
                             Terapkan ( = )
                           </button>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2 font-sans">Kategori & Ikon</label>
                  <div className="flex gap-2">
                    <div className="relative group/category flex-1">
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => { 
                          setCategory(e.target.value); 
                          setShowCatDropdown(true); 
                          // Auto set icon if mapped
                          const prefIcon = getCategoryIcon(e.target.value, type);
                          if (prefIcon && prefIcon !== 'TrendingUp' && prefIcon !== 'TrendingDown') {
                            setSelectedIcon(prefIcon);
                          } else if (categoryToIcon[e.target.value]) {
                            setSelectedIcon(categoryToIcon[e.target.value]);
                          }
                        }}
                        onFocus={() => setShowCatDropdown(true)}
                        required
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-stone-900/5 pr-12 font-bold"
                        placeholder="Cth. Makanan"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300">
                         <Tag className="w-5 h-5" />
                      </div>

                      <AnimatePresence>
                        {showCatDropdown && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setShowCatDropdown(false)} />
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-3xl shadow-2xl z-30 max-h-60 overflow-y-auto p-2"
                            >
                            <div className="grid grid-cols-1 gap-1">
                              {categorySuggestions
                                .filter((c) => c.toLowerCase().includes(category.toLowerCase()))
                                .map((cat, i) => {
                                  const catColor = getCategoryColor(cat, type);
                                  const group = categoryToGroup[cat];
                                  const iconName = getCategoryIcon(cat, type);
                                  const IconComp = iconName ? (LucideIcons as any)[iconName] : null;

                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => { 
                                        setCategory(cat); 
                                        if (iconName) setSelectedIcon(iconName);
                                        setShowCatDropdown(false); 
                                        playClick(); 
                                      }}
                                      className="text-left px-4 py-3 rounded-2xl hover:bg-stone-50 transition-colors flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: catColor }}>
                                           {IconComp ? <IconComp className="w-4 h-4" /> : cat[0].toUpperCase()}
                                        </div>
                                        <div>
                                           <p className="font-bold text-sm text-stone-800">{cat}</p>
                                           {group && <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{group}</p>}
                                        </div>
                                      </div>
                                      <ArrowRight className="w-4 h-4 text-stone-200" />
                                    </button>
                                  );
                                })}
                              {categorySuggestions.filter((c) => c.toLowerCase().includes(category.toLowerCase())).length === 0 && (
                                <div className="py-8 text-center text-stone-400 italic font-medium px-4">
                                  Ketik untuk kategori baru "{category}"
                                </div>
                              )}
                            </div>
                          </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="relative">
                       <button
                         type="button"
                         onClick={() => setShowIconPicker(!showIconPicker)}
                         className="h-[60px] w-[60px] bg-stone-50 border border-stone-100 rounded-2xl flex items-center justify-center hover:bg-stone-100 transition-colors shadow-sm"
                       >
                         {(() => {
                           const Icon = (LucideIcons as any)[selectedIcon] || Tag;
                           return <Icon className="w-6 h-6 text-stone-900" />;
                         })()}
                       </button>

                       <AnimatePresence>
                         {showIconPicker && (
                           <>
                             <div className="fixed inset-0 z-30" onClick={() => setShowIconPicker(false)} />
                             <motion.div 
                               initial={{ opacity: 0, scale: 0.9, y: 10 }}
                               animate={{ opacity: 1, scale: 1, y: 0 }}
                               exit={{ opacity: 0, scale: 0.9, y: 10 }}
                               className="absolute bottom-full right-0 mb-4 bg-white border border-stone-200 rounded-3xl shadow-2xl p-4 z-40 w-[280px]"
                             >
                             <div className="flex items-center justify-between mb-4 px-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Pilih Ikon</span>
                                <button onClick={() => setShowIconPicker(false)} className="text-stone-300 hover:text-stone-900"><X className="w-4 h-4" /></button>
                             </div>
                             <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                               {Array.from(new Set(["Utensils", "Coffee", "Pizza", "Sandwich", "Beer", "Fuel", "ShoppingBag", "Smartphone", "Zap", "Droplet", "Wifi", "Pocket", "Tag", "Wallet", "CreditCard", "Banknote", "Coins", "Briefcase", "Home", "Car", "Bus", "Plane", "Train", "Bike", "MapPin", "User", "Heart", "Star", "Smile", "Camera", "Film", "Tv", "Music", "Gamepad", "Laptop", "Headphones", "Gift", "PartyPopper", "Sprout", "Stethoscope", "Pill", "Gamepad2", "Brush", "Palette", "Cloud", "Sun", "Moon", "Bell", "Mail", "Users", "Scissors", "Ticket", "Dumbbell", "Globe"]))
                                .map((iconName) => {
                                 const IconComp = (LucideIcons as any)[iconName] || Tag;
                                 return (
                                   <button
                                     key={iconName}
                                     type="button"
                                     onClick={() => { setSelectedIcon(iconName); setShowIconPicker(false); playClick(); }}
                                     className={cn(
                                       "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                       selectedIcon === iconName ? "bg-stone-900 text-white shadow-lg" : "hover:bg-stone-50 text-stone-400"
                                     )}
                                   >
                                     <IconComp className="w-5 h-5" />
                                   </button>
                                 );
                               })}
                             </div>
                           </motion.div>
                           </>
                         )}
                       </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Catatan</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-stone-900/5 font-medium"
                    placeholder="Contoh: Makan siang di kantor"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-stone-200"
              >
                <Save className="w-5 h-5" /> Simpan Transaksi
              </button>
            </form>}
          </div>

          <div className="w-full space-y-6">
            <div className="flex flex-row gap-2 md:gap-4">
               <CustomDropdown
                 value={filterRange}
                 options={[
                   { value: "all", label: "Semua Waktu" },
                   { value: "this_week", label: "Minggu Ini" },
                   { value: "current_month", label: "Bulan Ini" },
                   { value: "last_month", label: "Bulan Lalu" },
                   { value: "last_year", label: "1 Tahun Terakhir" },
                   { value: "last_2_years", label: "2 Tahun Terakhir" },
                   { value: "custom", label: "Rentang Tanggal" }
                 ]}
                 onChange={(val) => setFilterRange(val)}
                 icon={<Calendar className="w-4 h-4" />}
               />
               {filterRange === "custom" && (
                 <div className="flex gap-2">
                   <input 
                     type="date" 
                     value={customStartDate} 
                     onChange={e => setCustomStartDate(e.target.value)}
                     className="bg-paper border border-stone-200 rounded-2xl px-4 py-3 font-bold text-sm text-stone-700 outline-none focus:border-stone-400"
                   />
                   <span className="self-center font-bold text-stone-400">-</span>
                   <input 
                     type="date" 
                     value={customEndDate} 
                     onChange={e => setCustomEndDate(e.target.value)}
                     className="bg-paper border border-stone-200 rounded-2xl px-4 py-3 font-bold text-sm text-stone-700 outline-none focus:border-stone-400"
                   />
                 </div>
               )}
               <CustomDropdown
                 value={filterCategory}
                 options={[
                   { value: "All", label: "Semua Kategori", iconComponent: <Filter className="w-4 h-4" /> },
                   ...allCategories.map(cat => {
                     const isIncome = incomeData.some(d => d.name === cat);
                     const iconName = getCategoryIcon(cat, isIncome ? 'income' : 'expense');
                     const Icon = iconName ? (LucideIcons as any)[iconName] : null;
                     return { 
                       value: cat, 
                       label: cat,
                       iconComponent: Icon ? <Icon className="w-4 h-4" /> : null
                     };
                   })
                 ]}
                 onChange={(val) => setFilterCategory(val)}
                 icon={<Filter className="w-4 h-4" />}
               />
            </div>

            {groupedRecordsByDate.length === 0 ? (
              <div className="bg-paper rounded-3xl border border-stone-200 p-20 text-center space-y-4 shadow-sm">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
                   <ListFilter className="w-10 h-10 text-stone-200" />
                </div>
                <div>
                   <h3 className="font-bold text-stone-900">Belum ada catatan</h3>
                   <p className="text-stone-400 text-sm">Tidak ditemukan transaksi untuk filter ini.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedRecordsByDate.map((group, groupIdx) => {
                  const dailyIncome = group.records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
                  const dailyExpense = group.records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
                  const dateKey = format(group.date, 'yyyy-MM-dd');
                  const isExpanded = expandedDates[dateKey] !== false; // Default expanded

                  return (
                    <section key={groupIdx} className="bg-paper border border-stone-200 rounded-[2rem] shadow-sm overflow-hidden mb-6">
                       <button 
                         onClick={() => toggleDateExpansion(group.date)}
                         className={cn("w-full flex items-center justify-between px-6 py-5 hover:bg-stone-50 transition-all group", isExpanded && "border-b border-stone-100")}
                       >
                          <div className="flex items-center gap-4">
                             <div className={cn("p-2 rounded-xl transition-colors", isExpanded ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-400")}>
                                <ChevronDown className={cn("w-5 h-5 transition-transform", !isExpanded && "-rotate-90")} />
                             </div>
                             <h3 className="font-bold font-serif text-xl text-stone-900">
                                {format(group.date, 'EEEE, d MMM yyyy', { locale: id })}
                             </h3>
                          </div>
                          <div className="flex gap-6 items-center">
                             <div className="flex flex-col items-end">
                                {dailyIncome > 0 && <span className="text-green-600 font-bold text-sm tracking-tight">{hideAmounts ? '+Rp •••' : `+Rp ${dailyIncome.toLocaleString('id-ID')}`}</span>}
                                {dailyExpense > 0 && <span className="text-red-500 font-bold text-sm tracking-tight">{hideAmounts ? '-Rp •••' : `-Rp ${dailyExpense.toLocaleString('id-ID')}`}</span>}
                             </div>
                          </div>
                       </button>
                       
                       <AnimatePresence>
                         {isExpanded && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: "auto", opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="overflow-hidden"
                           >
                             <div className="divide-y divide-stone-100/60">
                               {group.records.map((record) => (
                                  <div key={record.id} className="p-5 flex items-center justify-between hover:bg-stone-50 transition-all group relative">
                                     <div 
                                       className="absolute left-0 top-0 bottom-0 w-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                       style={{ backgroundColor: getCategoryColor(record.category, record.type) }}
                                     />
                                     <div className="flex items-center gap-4 min-w-0">
                                        <div 
                                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-110"
                                          style={{ backgroundColor: getCategoryColor(record.category, record.type) }}
                                        >
                                          {(() => {
                                            const Icon = record.iconName ? (LucideIcons as any)[record.iconName] || (record.type === 'income' ? TrendingUp : Minus) : (record.type === 'income' ? TrendingUp : Minus);
                                            return <Icon className="w-5 h-5" />;
                                          })()}
                                        </div>
                                        <div className="min-w-0">
                                           <div className="flex items-center gap-2">
                                              <p className="font-black text-stone-900 truncate tracking-tight">{record.category}</p>
                                              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{categoryToGroup[record.category] || '-'}</span>
                                           </div>
                                           <div className="flex items-center gap-2 mt-1">
                                              <p className="text-xs text-stone-400 font-medium">{format(record.createdAt, 'HH:mm')}</p>
                                              {record.note && <p className="text-xs text-stone-500 truncate italic">— {record.note}</p>}
                                           </div>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-4">
                                        <p className={cn(
                                          "font-black text-lg tracking-tighter text-right",
                                          record.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        )}>
                                           {hideAmounts ? 'Rp •••' : `${record.type === 'income' ? '+' : '-'}Rp ${record.amount.toLocaleString('id-ID')}`}
                                        </p>
                                        <ActionMenu 
                                          items={[
                                            { label: 'Ubah Data', icon: <Edit3 className="w-4 h-4" />, onClick: () => { setEditingRecord(record); setShowAddModal(true); } },
                                            { label: 'Hapus', icon: <Trash2 className="w-4 h-4" />, onClick: () => showConfirm("Hapus transaksi ini?", () => { deleteFinanceRecord(record.id); playError(); }), variant: 'danger' }
                                          ]}
                                          className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                          headerTitle="Opsi Transaksi"
                                        />
                                     </div>
                                  </div>
                               ))}
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'analysis' ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="flex bg-stone-50 p-1.5 rounded-2xl border border-stone-200 max-w-fit mx-auto mt-2">
              <button 
                onClick={() => setChartMode('grouped')}
                className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", chartMode === 'grouped' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600")}
              >Berdasarkan Grup</button>
              <button 
                onClick={() => setChartMode('detail')}
                className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", chartMode === 'detail' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600")}
              >Semua Detail</button>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-paper rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm flex flex-col">
                  <header className="w-full flex justify-between items-center mb-6">
                     <h3 className="font-serif text-2xl font-bold flex items-center gap-3">
                        Distribusi Pengeluaran
                     </h3>
                  </header>
                  <div className="w-full h-[350px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="40%"
                            outerRadius="60%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            onClick={(data) => handleChartClick(data, 'expense')}
                            className="cursor-pointer"
                          >
                            {expenseChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === "Lainnya" ? "#a8a29e" : getCategoryColor(entry.name, 'expense')} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-8 space-y-3 max-h-[500px] overflow-y-auto px-1 custom-scrollbar">
                    <div className="sticky top-0 bg-paper pt-2 pb-4 z-10">
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-stone-400 px-2">Analisis Kategori</h4>
                    </div>
                    {expenseData.length === 0 ? (
                      <p className="text-center text-stone-400 text-sm font-bold py-8">Belum ada data pengeluaran.</p>
                    ) : expenseData.map((data, i) => {
                      const pref = financeCategoryPrefs[data.name];
                      const iconName = pref?.iconName || getCategoryIcon(data.name, 'expense');
                      const Icon = (LucideIcons as any)[iconName] || TrendingDown;
                      const catColor = pref?.color || getCategoryColor(data.name, 'expense');
                      return (
                         <div
                           id={`detail-expense-${data.name}${parseFloat(data.displayPercent) < 3 ? '-Lainnya-Header' : ''}`}
                           key={i}
                           className={cn(
                             "flex items-center justify-between p-3 rounded-2xl transition-all group border",
                             (highlightedCategory === data.name || (highlightedCategory === 'Lainnya' && parseFloat(data.displayPercent) < 3))
                               ? "bg-stone-100 border-stone-300 ring-4 ring-stone-900/5 shadow-inner scale-[0.98]"
                               : "border-transparent hover:bg-stone-50 hover:border-stone-100"
                           )}
                         >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: catColor }}>
                                 <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="font-bold text-sm text-stone-800">{data.name}</p>
                                 <p className="text-[10px] font-black tracking-widest uppercase text-stone-400">{data.displayPercent}%</p>
                              </div>
                           </div>
                           <p className="font-bold tracking-tight text-red-600">Rp {data.value.toLocaleString('id-ID')}</p>
                         </div>
                      );
                    })}
                  </div>
               </div>

               <div className="bg-paper rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm flex flex-col">
                  <header className="w-full flex justify-between items-center mb-6">
                     <h3 className="font-serif text-2xl font-bold">
                        Distribusi Pemasukan
                     </h3>
                  </header>
                  <div className="w-full h-[350px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="40%"
                            outerRadius="60%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            onClick={(data) => handleChartClick(data, 'income')}
                            className="cursor-pointer"
                          >
                            {incomeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === "Lainnya" ? "#a8a29e" : getCategoryColor(entry.name, 'income')} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>

                  <div className="mt-8 space-y-3 max-h-[500px] overflow-y-auto px-1 custom-scrollbar">
                    <div className="sticky top-0 bg-paper pt-2 pb-4 z-10">
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-stone-400 px-2">Analisis Kategori</h4>
                    </div>
                    {incomeData.length === 0 ? (
                      <p className="text-center text-stone-400 text-sm font-bold py-8">Belum ada data pemasukan.</p>
                    ) : incomeData.map((data, i) => {
                      const pref = financeCategoryPrefs[data.name];
                      const iconName = pref?.iconName || getCategoryIcon(data.name, 'income');
                      const Icon = (LucideIcons as any)[iconName] || TrendingUp;
                      const catColor = pref?.color || getCategoryColor(data.name, 'income');
                      return (
                         <div
                           id={`detail-income-${data.name}${parseFloat(data.displayPercent) < 3 ? '-Lainnya-Header' : ''}`}
                           key={i}
                           className={cn(
                             "flex items-center justify-between p-3 rounded-2xl transition-all group border",
                             (highlightedCategory === data.name || (highlightedCategory === 'Lainnya' && parseFloat(data.displayPercent) < 3))
                               ? "bg-stone-100 border-stone-300 ring-4 ring-stone-900/5 shadow-inner scale-[0.98]"
                               : "border-transparent hover:bg-stone-50 hover:border-stone-100"
                           )}
                         >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: catColor }}>
                                 <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="font-bold text-sm text-stone-800">{data.name}</p>
                                 <p className="text-[10px] font-black tracking-widest uppercase text-stone-400">{data.displayPercent}%</p>
                              </div>
                           </div>
                           <p className="font-bold tracking-tight text-green-600">Rp {data.value.toLocaleString('id-ID')}</p>
                         </div>
                      );
                    })}
                  </div>
               </div>
           </div>
        </div>
      ) : activeTab === 'planning' ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-paper p-8 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8 flex flex-col">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg ring-4 ring-stone-100">
                          <TrendingUp className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-serif text-2xl font-bold">Anggaran</h3>
                          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Kontrol Pengeluaran</p>
                       </div>
                    </div>
                    <button onClick={() => {
                        const nameEl = document.getElementById('budget-form');
                        if (nameEl) nameEl.scrollIntoView({ behavior: 'smooth' });
                    }} className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all shadow-sm active:scale-95">
                       <Plus className="w-5 h-5 text-stone-700" />
                    </button>
                 </div>

                 {/* Budget Form */}
                 <div id="budget-form" className="p-6 bg-stone-50 rounded-3xl border border-stone-200/50 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Kategori</label>
                          <input id="new-budget-cat" type="text" className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-stone-900" placeholder="Cth. Makanan" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Nominal</label>
                          <input id="new-budget-amt" type="number" className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-stone-900" placeholder="0" />
                       </div>
                    </div>
                    <button 
                      onClick={() => {
                        const c = (document.getElementById('new-budget-cat') as HTMLInputElement).value;
                        const a = (document.getElementById('new-budget-amt') as HTMLInputElement).value;
                        if(c && a) {
                           addBudget({ id: uuidv4(), category: c, amount: parseFloat(a), period: 'monthly', createdAt: Date.now() });
                           (document.getElementById('new-budget-cat') as HTMLInputElement).value = '';
                           (document.getElementById('new-budget-amt') as HTMLInputElement).value = '';
                           playSuccess();
                        }
                      }}
                      className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold transition-all hover:bg-stone-800"
                    >
                      Tambah Anggaran
                    </button>
                 </div>
                 
                 <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
                    {budgets.length === 0 ? (
                       <div className="text-center py-20 bg-stone-50/50 rounded-3xl border border-stone-100 border-dashed">
                          <p className="text-stone-400 italic text-sm">Belum ada anggaran.</p>
                       </div>
                    ) : budgets.map(b => (
                       <div key={b.id} className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex items-center justify-between hover:border-stone-300 transition-all group">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{b.category}</p>
                             <p className="font-black text-2xl text-stone-900 tracking-tighter">Rp {b.amount.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <button onClick={() => showConfirm(`Hapus anggaran "${b.category}"?`, () => { deleteBudget(b.id); playError(); })} className="p-3 text-stone-300 hover:text-red-500 hover:bg-white rounded-2xl transition-all opacity-100">
                                <Trash2 className="w-5 h-5"/>
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>

              <section className="bg-paper p-8 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8 flex flex-col relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <Heart className="w-48 h-48" />
                 </div>
                 <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-100 ring-4 ring-pink-50">
                          <Heart className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-serif text-2xl font-bold">Tabungan</h3>
                          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Simpanan & Investasi</p>
                       </div>
                    </div>
                    <button onClick={() => {
                        const el = document.getElementById('saving-form');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }} className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all shadow-sm active:scale-95">
                       <Plus className="w-5 h-5 text-stone-700" />
                    </button>
                 </div>

                 {/* Saving Form */}
                 <div id="saving-form" className="p-6 bg-pink-50/50 rounded-3xl border border-pink-100 space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-pink-400 pl-1">Nama Simpanan</label>
                          <input id="new-saving-name" type="text" className="w-full bg-white border border-pink-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500" placeholder="Cth. Dana Darurat" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-pink-400 pl-1">Saldo</label>
                          <input id="new-saving-amt" type="number" className="w-full bg-white border border-pink-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500" placeholder="0" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-pink-400 pl-1">Target (Ops)</label>
                          <input id="new-saving-target" type="number" className="w-full bg-white border border-pink-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500" placeholder="0" />
                       </div>
                    </div>
                    <button 
                      onClick={() => {
                        const n = (document.getElementById('new-saving-name') as HTMLInputElement).value;
                        const s = (document.getElementById('new-saving-amt') as HTMLInputElement).value;
                        const t = (document.getElementById('new-saving-target') as HTMLInputElement).value;
                        if(n && s) {
                           addSaving({ id: uuidv4(), name: n, currentAmount: parseFloat(s), targetAmount: parseFloat(t || '0'), location: 'Bank', createdAt: Date.now() });
                           (document.getElementById('new-saving-name') as HTMLInputElement).value = '';
                           (document.getElementById('new-saving-amt') as HTMLInputElement).value = '';
                           (document.getElementById('new-saving-target') as HTMLInputElement).value = '';
                           playSuccess();
                        }
                      }}
                      className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold transition-all hover:bg-pink-600 shadow-lg shadow-pink-100"
                    >
                      Buka Tabungan Baru
                    </button>
                 </div>

                 <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto px-1 custom-scrollbar relative z-10">
                    {savings.length === 0 ? (
                       <div className="text-center py-20 bg-stone-50/50 rounded-3xl border border-stone-100 border-dashed">
                          <p className="text-stone-400 italic text-sm">Belum ada catatan simpanan.</p>
                       </div>
                    ) : savings.map(s => (
                       <div key={s.id} className="p-6 bg-white rounded-3xl border border-stone-100 relative group overflow-hidden shadow-sm hover:border-pink-200 transition-all">
                          <div className="flex justify-between items-start relative z-10">
                             <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                   <div className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded text-[9px] font-black uppercase tracking-widest">{s.location}</div>
                                   <div className="w-1 h-1 rounded-full bg-stone-300" />
                                   <p className="text-xs font-bold text-stone-900">{s.name}</p>
                                </div>
                                <p className="font-black text-2xl text-stone-900 tracking-tighter">Rp {s.currentAmount.toLocaleString('id-ID')}</p>
                                
                                {s.targetAmount > 0 && (
                                   <div className="mt-4 space-y-2">
                                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                         <span className="text-stone-400">Target: Rp {s.targetAmount.toLocaleString('id-ID')}</span>
                                         <span className="text-pink-600">{Math.min(100, Math.round((s.currentAmount / s.targetAmount) * 100))}%</span>
                                      </div>
                                      <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-50">
                                         <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${Math.min(100, (s.currentAmount / s.targetAmount) * 100)}%` }}
                                           className="h-full bg-pink-500 rounded-full shadow-sm"
                                         />
                                      </div>
                                   </div>
                                )}
                             </div>
                             <div className="flex gap-1 ml-4 transition-opacity">
                                <button onClick={() => {
                                   const newAmt = prompt("Update Saldo:", s.currentAmount.toString());
                                   if(newAmt) {
                                      updateSaving({...s, currentAmount: parseFloat(newAmt)});
                                      playSuccess();
                                   }
                                }} className="p-2.5 bg-stone-50 text-stone-400 hover:text-stone-900 rounded-xl transition-all"><Edit3 className="w-4 h-4"/></button>
                                <button onClick={() => showConfirm(`Hapus tabungan "${s.name}"?`, () => { deleteSaving(s.id); playError(); })} className="p-2.5 bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      ) : activeTab === 'settings' ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           {/* Theme Settings */}
           <div className="bg-paper border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm">
             <header className="mb-6 flex items-center justify-between">
               <div>
                 <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                    {darkMode ? <LucideIcons.Moon className="w-6 h-6 text-accent-purple" /> : <LucideIcons.Sun className="w-6 h-6 text-accent-orange" />}
                    Tampilan
                 </h2>
                 <p className="text-stone-500 text-sm mt-1">Personalisasi antarmuka aplikasi.</p>
               </div>
               <button 
                 onClick={() => setDarkMode(!darkMode)}
                 className={cn(
                   "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent",
                   darkMode ? "bg-accent-purple" : "bg-stone-200"
                 )}
               >
                 <span className={cn(
                   "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm",
                   darkMode ? "translate-x-7" : "translate-x-1"
                 )} />
               </button>
             </header>
             <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-3">
                   <div className={cn("p-2 rounded-xl", darkMode ? "bg-accent-purple/10 text-accent-purple" : "bg-accent-orange/10 text-accent-orange")}>
                      {darkMode ? <LucideIcons.Moon className="w-4 h-4" /> : <LucideIcons.Sun className="w-4 h-4" />}
                   </div>
                   <div>
                      <p className="font-bold text-sm">Mode Gelap</p>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black">Aktifkan untuk kenyamanan mata</p>
                   </div>
                </div>
                <div className="text-xs font-bold text-stone-400">
                   {darkMode ? "Aktif" : "Nonaktif"}
                </div>
             </div>
           </div>

           <div className="bg-paper border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm">
             <header className="mb-8">
               <h2 className="font-serif text-2xl font-bold text-stone-900">Grup & Kategori</h2>
               <p className="text-stone-500 text-sm mt-1">Kelola pengelompokan dan preferensi kustomisasi kategori.</p>
             </header>

             <div className="space-y-12">
               {/* Categories Section */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-black text-xs uppercase tracking-widest text-stone-400 flex items-center gap-2">
                     <Tag className="w-4 h-4" /> Kustomisasi Kategori
                   </h3>
                   <button
                     onClick={() => {
                        Object.keys(categoryEdits).forEach(oldCat => {
                          const edits = categoryEdits[oldCat];
                          if (edits.name.trim() !== oldCat && edits.name.trim() !== "") {
                            updateFinanceCategoryBulk(oldCat, edits.name.trim());
                          }
                          updateCategoryPref(edits.name.trim() || oldCat, {
                            iconName: edits.iconName,
                            color: edits.color
                          });
                        });
                        setAlert("Perubahan kategori disimpan!");
                        playSuccess();
                     }}
                     className="px-6 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-sm"
                   >
                     Simpan Perubahan
                   </button>
                 </div>

                 <div className="space-y-8">
                   {["income", "expense"].map(type => {
                     const isIncome = type === "income";
                     const filteredCategories = allCategories.filter(cat => {
                       const inIncome = incomeData.some(d => d.name === cat);
                       return isIncome ? inIncome : !inIncome;
                     });

                     if (filteredCategories.length === 0) return null;

                     return (
                       <div key={type} className="space-y-4">
                         <h4 className="font-bold text-sm text-stone-700 flex items-center gap-2">
                           <div className={cn("w-2 h-2 rounded-full", isIncome ? "bg-green-500" : "bg-red-500")} />
                           Kategori {isIncome ? "Pemasukan" : "Pengeluaran"}
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                           {filteredCategories.map(cat => {
                             const editObj = getCatEdit(cat, isIncome);
                             const Icon = (LucideIcons as any)[editObj.iconName] || (isIncome ? TrendingUp : TrendingDown);

                             return (
                               <div key={cat} className="bg-stone-50 border border-stone-100 rounded-2xl p-3 flex flex-col gap-3 group relative">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <button 
                                        type="button"
                                        onClick={() => setPickingIconFor(pickingIconFor === cat ? null : cat)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 active:scale-95 transition-transform"
                                        style={{ backgroundColor: editObj.color }}
                                      >
                                        <Icon className="w-5 h-5" />
                                      </button>
                                      {pickingIconFor === cat && (
                                        <div className="absolute top-12 left-0 w-64 bg-white border border-stone-200 shadow-xl rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 grid grid-cols-6 gap-2">
                                           {AVAILABLE_ICONS.map(i => {
                                              const Ico = (LucideIcons as any)[i];
                                              return (
                                                <button
                                                  key={i}
                                                  onClick={() => {
                                                    setCategoryEdits(p => ({...p, [cat]: {...editObj, iconName: i}}));
                                                    setPickingIconFor(null);
                                                  }}
                                                  className="p-2 hover:bg-stone-100 rounded-lg flex items-center justify-center text-stone-600 transition-colors"
                                                >
                                                  {Ico && <Ico className="w-4 h-4" />}
                                                </button>
                                              )
                                           })}
                                        </div>
                                      )}
                                    </div>
                                    <input 
                                      type="text"
                                      value={editObj.name}
                                      onChange={(e) => setCategoryEdits(p => ({...p, [cat]: {...editObj, name: e.target.value}}))}
                                      className="flex-1 bg-transparent border-b border-stone-200 outline-none focus:border-stone-900 font-bold text-sm pb-1 text-stone-800 focus:bg-white px-2 rounded-t transition-colors"
                                    />
                                    <input 
                                      type="color"
                                      value={editObj.color}
                                      onChange={(e) => setCategoryEdits(p => ({...p, [cat]: {...editObj, color: e.target.value}}))}
                                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shrink-0"
                                    />
                                  </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     )
                   })}
                 </div>
               </section>

               {/* Groups Section */}
               <section className="border-t border-stone-100 pt-8">
                 <h3 className="font-black text-xs uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                   <Folder className="w-4 h-4" /> Pengelompokan Grup
                 </h3>
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                      type="text"
                      placeholder="Masukkan nama grup baru..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-stone-900 font-bold"
                    />
                    <button
                      onClick={() => {
                        if (!newGroupName.trim()) return;
                        updateFinanceMapping(newGroupName.trim(), []);
                        setNewGroupName("");
                        playSuccess();
                      }}
                      className="px-8 py-4 md:py-0 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Tambah Grup
                    </button>
                  </div>
                  
                  <div className="space-y-8">
                    {["income", "expense"].map(type => {
                       const isIncome = type === "income";
                       const filteredGroups = existingGroups.filter(g => {
                           const cats = financeMappings[g] || [];
                           const hasIncomeCat = cats.some(c => incomeData.some(d => d.name === c));
                           if (cats.length === 0) return !isIncome;
                           return isIncome ? hasIncomeCat : !hasIncomeCat;
                       });

                       if (filteredGroups.length === 0) return null;

                       return (
                         <div key={type} className="space-y-4">
                            <h4 className="font-bold text-sm text-stone-700 flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", isIncome ? "bg-green-500" : "bg-red-500")} />
                              Grup {isIncome ? "Pemasukan" : "Pengeluaran"}
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {filteredGroups.map(group => {
                                const categories = financeMappings[group] || [];
                                const isManaged = managedGroup === group;
                                
                                return (
                                  <div key={group} className="bg-stone-50 border border-stone-200 rounded-3xl p-5 flex flex-col space-y-4 hover:border-stone-400 transition-all shadow-sm">
                                    <header className="flex items-center justify-between">
                                      <h5 className="font-serif text-lg font-bold text-stone-800">
                                        {group}
                                      </h5>
                                      <button
                                        onClick={() => {
                                          showConfirm(`Hapus grup "${group}"?`, () => {
                                            deleteFinanceMapping(group);
                                            playError();
                                          });
                                        }}
                                        className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </header>

                                    <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                                      {categories.length === 0 ? (
                                        <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest italic">— Kosong</span>
                                      ) : categories.map((cat, idx) => {
                                        const customPref = financeCategoryPrefs[cat];
                                        const fallbackIcon = categoryToIcon[cat];
                                        const IconName = customPref?.iconName || fallbackIcon;
                                        const IconComp = IconName ? (LucideIcons as any)[IconName] : null;

                                        return (
                                          <div key={idx} className="group relative flex items-center gap-1.5 bg-white border border-stone-200 px-2 py-1 rounded-lg">
                                            {IconComp && <IconComp className="w-3 h-3 text-stone-400" />}
                                            <span className="text-[10px] font-bold text-stone-700">{cat}</span>
                                            <button
                                              onClick={() => {
                                                const newCats = categories.filter(c => c !== cat);
                                                updateFinanceMapping(group, newCats);
                                                playClick();
                                              }}
                                              className="ml-1 w-3.5 h-3.5 bg-red-50 text-red-400 rounded flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    <div className="pt-2 border-t border-stone-200/50">
                                      {isManaged ? (
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                              <select
                                                autoFocus
                                                value={newGroupCategory}
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  setNewGroupCategory(val);
                                                  if (val && !categories.includes(val)) {
                                                    updateFinanceMapping(group, [...categories, val]);
                                                    setNewGroupCategory("");
                                                  }
                                                }}
                                                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-stone-900 font-bold"
                                              >
                                                <option value="" disabled>Pilih kategori...</option>
                                                {allCategories.filter(c => !categories.includes(c) && (isIncome ? incomeData.some(d => d.name === c) : !incomeData.some(d => d.name === c))).map(cat => (
                                                  <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                              </select>
                                            </div>
                                            <button onClick={() => { setManagedGroup(null); setNewGroupCategory(""); }} className="p-2 bg-stone-100 rounded-xl"><X className="w-4 h-4" /></button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => { setManagedGroup(group); setNewGroupCategory(""); playClick(); }}
                                          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 hover:border-stone-400 transition-all bg-stone-50/50"
                                        >
                                            <Plus className="w-3 h-3" /> Tambah Kategori
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                         </div>
                       );
                    })}
                  </div>
               </section>
             </div>
           </div>
        </div>
      ) : null}

      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCategory(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-paper w-full max-w-md rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-stone-900 text-white rounded-2xl">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Edit Kategori</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{editingCategory.oldName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2 font-sans">Nama Kategori</label>
                  <input
                    type="text"
                    value={editingCategory.newName}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, newName: e.target.value } : null)}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-stone-900/5 font-bold"
                  />
                  <p className="text-[10px] text-orange-500 mt-2 italic font-medium leading-relaxed">Peringatan: Mengubah nama akan mengupdate semua riwayat transaksi yang menggunakan kategori ini.</p>
                </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-4 font-sans">Pilih Ikon Baru</label>
                    <div className="p-4 bg-stone-50 rounded-[2rem] border border-stone-100">
                      <div className="grid grid-cols-1 gap-6 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                        {ICON_GROUPS.map(group => (
                          <div key={group.name} className="space-y-3">
                             <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-400 pl-1">{group.name}</h4>
                             <div className="grid grid-cols-6 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                               {group.icons.map(icon => {
                                 const IconComp = (LucideIcons as any)[icon] || Tag;
                                 const isSelected = editingCategory?.iconName === icon;
                                 return (
                                   <button
                                     key={icon}
                                     onClick={() => setEditingCategory(prev => prev ? {...prev, iconName: icon} : null)}
                                     className={cn(
                                       "aspect-square rounded-xl flex items-center justify-center border transition-all",
                                       isSelected ? "bg-stone-900 border-stone-900 text-white shadow-md scale-110" : "bg-white border-stone-100 text-stone-400 hover:border-stone-300"
                                     )}
                                   >
                                     <IconComp className="w-5 h-5" />
                                   </button>
                                 );
                               })}
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-4 font-sans">Warna Kategori (Hue)</label>
                    <div className="space-y-4">
                       <div className="flex flex-wrap gap-3 p-4 bg-stone-50 rounded-3xl border border-stone-100">
                          {[0, 25, 45, 80, 140, 190, 220, 270, 300, 330, 350].map(hue => {
                             const color = `hsl(${hue}, 70%, 50%)`;
                             const isSelected = editingCategory?.color === color;
                             return (
                               <button
                                 key={hue}
                                 onClick={() => setEditingCategory(prev => prev ? {...prev, color: color} : null)}
                                 className={cn(
                                   "w-10 h-10 rounded-full border-4 transition-all shadow-sm active:scale-95",
                                   isSelected ? "border-stone-900 scale-110" : "border-white hover:scale-105"
                                 )}
                                 style={{ backgroundColor: color }}
                               />
                             );
                          })}
                       </div>
                       <div className="flex gap-4 items-center">
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            className="flex-1 accent-stone-900"
                            onChange={(e) => {
                               const hue = e.target.value;
                               setEditingCategory(prev => prev ? {...prev, color: `hsl(${hue}, 70%, 50%)`} : null);
                            }}
                          />
                          <div className="w-12 h-12 rounded-2xl border-4 border-white shadow-xl shrink-0" style={{ backgroundColor: editingCategory?.color }} />
                       </div>
                    </div>
                </div>

                <button
                  onClick={() => {
                    if (!editingCategory.newName.trim() || !editingCategory.iconName.trim() || !editingCategory.color.trim()) {
                      setAlert("Harap lengkapi semua field!");
                      return;
                    }
                    if (editingCategory.newName.trim() !== editingCategory.oldName) {
                      updateFinanceCategoryBulk(editingCategory.oldName, editingCategory.newName.trim());
                    }
                    updateCategoryPref(editingCategory.newName.trim(), {
                      iconName: editingCategory.iconName.trim(),
                      color: editingCategory.color.trim()
                    });
                    setEditingCategory(null);
                    playSuccess();
                  }}
                  className="w-full bg-stone-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs hover:bg-stone-800 active:scale-[0.98] transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WorkspaceSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        contextType="finance"
      />

      {/* AI Parsing Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIModal(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-paper w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-stone-900 text-white rounded-2xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">AI Input</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Parse teks jadi data</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Ketik catatanmu, AI akan memisahkan nominal, kategori, dan jenis transaksi secara otomatis.
                  </p>
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-700 italic">
                    Contoh: "Beli bensin 50rb tadi pagi, trus makan siang 30rb, dapet gaji 5jt"
                  </div>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Masukkan catatan keuangan..."
                    className="w-full h-40 bg-stone-50 border border-stone-100 rounded-2xl p-6 outline-none focus:ring-4 focus:ring-stone-900/5 font-medium resize-none"
                    disabled={isParsing}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="flex-1 px-8 py-4 bg-stone-50 text-stone-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-100 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAIParsing}
                    disabled={isParsing || !aiPrompt.trim()}
                    className={cn(
                      "flex-[2] px-8 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-stone-200",
                      (isParsing || !aiPrompt.trim()) ? "opacity-50 cursor-not-allowed" : "hover:bg-stone-800"
                    )}
                  >
                    {isParsing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Proses Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddFinanceModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingRecord(null); }}
        addFinanceRecord={editingRecord ? updateFinanceRecord : addFinanceRecord}
        financeRecords={financeRecords}
        categoryToGroup={categoryToGroup}
        financeCategoryPrefs={financeCategoryPrefs}
        playSuccess={playSuccess}
        playClick={playClick}
        initialRecord={editingRecord}
      />

      {activeTab === 'records' && (
        <button
          onClick={() => { setShowAddModal(true); playClick(); }}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 ring-4 ring-white"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}
