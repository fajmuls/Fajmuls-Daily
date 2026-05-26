import React, { useState, FormEvent, useMemo, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { ICON_GROUPS } from "../data";
import {
  format,
  isSameDay,
  startOfMonth,
  subMonths,
  subYears,
  subDays,
  isAfter,
} from "date-fns";
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
  Printer,
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
  Edit3,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "../lib/utils";
import { useAudio } from "../hooks/useAudio";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

import { WorkspaceSyncModal } from "../components/WorkspaceSyncModal";
import { ActionMenu } from "../components/ActionMenu";
import { AddFinanceModal } from "../components/AddFinanceModal";

const AVAILABLE_ICONS = [
  "Utensils",
  "Coffee",
  "Pizza",
  "Sandwich",
  "Beer",
  "Fuel",
  "ShoppingBag",
  "Smartphone",
  "Zap",
  "Droplet",
  "Wifi",
  "Tag",
  "Wallet",
  "CreditCard",
  "Home",
  "Car",
  "Bus",
  "Plane",
  "Train",
  "Bike",
  "MapPin",
  "User",
  "Heart",
  "Star",
  "Camera",
  "Film",
  "Tv",
  "Music",
  "Gamepad",
  "Laptop",
  "Headphones",
  "Gift",
  "PartyPopper",
  "Sprout",
  "Stethoscope",
  "Pill",
  "Palette",
  "Cloud",
  "Sun",
  "Moon",
  "Bell",
  "Ticket",
  "Globe",
  "Book",
  "Briefcase",
  "Dumbbell",
  "Shield",
  "Search",
  "PenTool",
  "Scissors",
  "Shirt",
  "Video",
  "Mic",
  "Printer",
  "Compass",
  "Key",
  "Activity",
  "BookOpen",
  "Box",
  "Feather",
  "Flag",
  "Map",
  "Package",
  "Smile",
  "Watch",
  "Thermometer",
  "Umbrella",
  "Wine",
  "CupSoda",
  "Bed",
  "Anchor",
  "Cat",
  "Dog",
  "Fish",
  "Bone",
  "Ghost",
  "Bug",
  "Rocket",
  "PlaneTakeoff",
  "Apple",
  "Carrot",
  "Egg",
  "Trophy",
  "Award",
  "Medal",
  "Crown",
  "Coins",
  "Banknote",
  "Percent",
  "Receipt",
  "Calculator",
  "PiggyBank",
  "Wrench",
  "Hammer",
  "Drill",
  "Screwdriver",
];

function CustomDropdown({
  value,
  options,
  onChange,
  icon,
}: {
  value: string;
  options: { value: string; label: string; iconComponent?: React.ReactNode }[];
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative flex-1 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-paper border border-stone-200 rounded-2xl p-4 px-4 md:px-6 flex items-center justify-between shadow-sm hover:border-stone-400 transition-all font-bold text-xs md:text-sm text-stone-700"
      >
        <div className="flex items-center gap-3">
          {selected.iconComponent ? (
            <span className="text-stone-400">{selected.iconComponent}</span>
          ) : (
            icon && <span className="text-stone-400">{icon}</span>
          )}
          <span>{selected.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-stone-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
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
                    value === opt.value
                      ? "bg-stone-900 text-white"
                      : "hover:bg-stone-50 text-stone-700",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {opt.iconComponent && (
                      <span
                        className={cn(
                          value === opt.value
                            ? "text-stone-300"
                            : "text-stone-400",
                        )}
                      >
                        {opt.iconComponent}
                      </span>
                    )}
                    <span className="font-bold text-sm">{opt.label}</span>
                  </div>
                  {value === opt.value && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
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
  const [showPrintView, setShowPrintView] = useState(false);

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
    setDarkMode,
  } = useAppContext();
  const { playSuccess, playError, playClick } = useAudio();

  const [activeTab, setActiveTab] = useState<
    "records" | "analysis" | "settings" | "planning"
  >("records");
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
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(
    null,
  );
  const [addRecordDate, setAddRecordDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("Tag");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [settingsSearch, setSettingsSearch] = useState("");
  const [selectionSearch, setSelectionSearch] = useState("");

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatModalName, setNewCatModalName] = useState("");
  const [addCatModalTargetGroup, setAddCatModalTargetGroup] = useState<
    string | null
  >(null);

  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupModalName, setNewGroupModalName] = useState("");

  const [showUpdateBalanceModal, setShowUpdateBalanceModal] = useState(false);
  const [updateBalanceSavingId, setUpdateBalanceSavingId] = useState<
    string | null
  >(null);
  const [newBalanceModalValue, setNewBalanceModalValue] = useState("");

  const [editingCategory, setEditingCategory] = useState<{
    oldName: string;
    newName: string;
    type: "income" | "expense";
    iconName: string;
    color: string;
  } | null>(null);

  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(
    null,
  );

  const handleChartClick = (data: any, type: "expense" | "income") => {
    if (data?.payload?.name) {
      let targetName = data.payload.name;
      const originalData = type === "expense" ? expenseData : incomeData;

      // If clicking "Lainnya", find the first category in Lainnya
      if (targetName === "Lainnya") {
        const others = originalData.filter(
          (d) => parseFloat(d.displayPercent) < 3,
        );
        if (others.length > 0) {
          // Highlight all categories in "Lainnya" or just scroll to the first one
          // The user said: "Yang disorot adalah yang sudah dikelompokkan ke dalam lainnya."
          // We'll set a special state to highlight all of them
          setHighlightedCategory("Lainnya");
          const el = document.getElementById(`detail-${type}-Lainnya-Header`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => setHighlightedCategory(null), 5000);
          return;
        }
      }

      const el = document.getElementById(`detail-${type}-${targetName}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
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

  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {},
  );

  const toggleDateExpansion = (date: number) => {
    const key = format(date, "yyyy-MM-dd");
    setExpandedDates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Group mappings management
  const [newGroupCategory, setNewGroupCategory] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [managedGroup, setManagedGroup] = useState<string | null>(null);

  const [categoryEdits, setCategoryEdits] = useState<
    Record<string, { name: string; iconName: string; color: string }>
  >({});
  const [pickingIconFor, setPickingIconFor] = useState<string | null>(null);
  const [pickingColorFor, setPickingColorFor] = useState<string | null>(null);

  const getCatEdit = (cat: string, isIncome: boolean) => {
    if (categoryEdits[cat]) return categoryEdits[cat];
    const fpColor = getCategoryColor(cat, isIncome ? "income" : "expense");
    return {
      name: cat,
      iconName:
        financeCategoryPrefs[cat]?.iconName ||
        categoryToIcon[cat] ||
        (isIncome ? "TrendingUp" : "TrendingDown"),
      color: financeCategoryPrefs[cat]?.color || fpColor,
    };
  };

  // Memoized category to group map for easy lookup
  const categoryToGroup = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(financeMappings as Record<string, string[]>).forEach(
      ([group, cats]) => {
        cats.forEach((cat) => {
          map[cat] = group;
        });
      },
    );
    return map;
  }, [financeMappings]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    financeRecords.forEach((r) => set.add(r.category));
    return Array.from(set).sort();
  }, [financeRecords]);

  const unmappedCategories = useMemo(() => {
    return allCategories.filter((cat) => !categoryToGroup[cat]);
  }, [allCategories, categoryToGroup]);

  const filteredRecords = useMemo(() => {
    let records = [...financeRecords];

    // Filter by Range
    const now = new Date();
    if (filterRange === "current_month") {
      const start = startOfMonth(now);
      records = records.filter((r) => isAfter(new Date(r.createdAt), start));
    } else if (filterRange === "this_week") {
      const currentDay = now.getDay();
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      const start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      records = records.filter(
        (r) => new Date(r.createdAt).getTime() >= start.getTime(),
      );
    } else if (filterRange === "last_month") {
      const start = startOfMonth(subMonths(now, 1));
      const end = startOfMonth(now);
      records = records.filter(
        (r) =>
          isAfter(new Date(r.createdAt), start) &&
          !isAfter(new Date(r.createdAt), end),
      );
    } else if (filterRange === "last_year") {
      const start = subYears(now, 1);
      records = records.filter((r) => isAfter(new Date(r.createdAt), start));
    } else if (filterRange === "last_2_years") {
      const start = subYears(now, 2);
      records = records.filter((r) => isAfter(new Date(r.createdAt), start));
    } else if (filterRange === "custom") {
      const start = customStartDate ? new Date(customStartDate) : new Date(0);
      const end = customEndDate ? new Date(customEndDate) : new Date(now);
      end.setHours(23, 59, 59, 999);
      records = records.filter((r) => {
        const d = new Date(r.createdAt);
        return d >= start && d <= end;
      });
    }

    // Filter by Category
    if (filterCategory !== "All") {
      records = records.filter((r) => r.category === filterCategory);
    }

    return records;
  }, [
    financeRecords,
    filterCategory,
    filterRange,
    customStartDate,
    customEndDate,
  ]);

  // Group records by date
  const groupedRecordsByDate = useMemo(() => {
    const groups: { date: number; records: FinanceRecord[] }[] = [];
    filteredRecords.forEach((record) => {
      const existing = groups.find((g) => isSameDay(g.date, record.createdAt));
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
          iconName: r.iconName || (r.type === "income" ? "TrendingUp" : "Tag"),
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
        .filter(
          (r) => isSameDay(new Date(r.createdAt), date) && r.type === "expense",
        )
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
        ? [
            "Gaji",
            "Bonus",
            "Investasi",
            "Hadiah",
            "Freelance",
            "Penjualan",
            "Bisnis",
            "Subsidi",
            "Pencairan",
            "Royalti",
          ]
        : [
            "Makanan",
            "Kopi & Jajan",
            "Transportasi Umum",
            "BBM",
            "Tagihan",
            "Belanja Harian",
            "Belanja Online",
            "Pulsa & Data",
            "Listrik",
            "Air",
            "Internet",
            "Hiburan",
            "Kesehatan",
            "Obat",
            "Pakaian",
            "Pendidikan",
            "Sedekah",
            "Sosial",
            "Perawatan",
            "Hewan Peliharaan",
            "Perawatan Kendaraan",
            "Keperluan Rumah",
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
      {
        category: "Investasi kripto",
        amount: 1800000,
        type: "expense" as const,
      },
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
      createdAt: Date.now() - i * 1000, // Slightly spread out
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
    expenseData.forEach((item) => {
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
        displayPercent: lainnyaPercent.toFixed(1),
      });
    }
    return mainData;
  }, [expenseData]);

  const incomeChartData = useMemo(() => {
    const mainData: typeof incomeData = [];
    let lainnyaValue = 0;
    let lainnyaPercent = 0;
    incomeData.forEach((item) => {
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
        displayPercent: lainnyaPercent.toFixed(1),
      });
    }
    return mainData;
  }, [incomeData]);

  const [trendFilter, setTrendFilter] = useState<"1m" | "6m" | "1y">("6m");

  const trendData = useMemo(() => {
    const list: any[] = [];
    const now = new Date();
    
    if (trendFilter === "1m") {
      // Last 30 days (Per Hari)
      for (let i = 29; i >= 0; i--) {
        const d = subDays(now, i);
        list.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          date: d.getDate(),
          label: format(d, "dd MMM", { locale: id }),
          pemasukan: 0,
          pengeluaran: 0,
        });
      }
    } else {
      const monthCount = trendFilter === "1y" ? 11 : 5;
      for (let i = monthCount; i >= 0; i--) {
        const d = subMonths(now, i);
        list.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          label: format(d, "MMM yyyy", { locale: id }),
          pemasukan: 0,
          pengeluaran: 0,
        });
      }
    }

    financeRecords.forEach((record) => {
      const recordDate = new Date(record.createdAt);
      
      let item = null;
      if (trendFilter === "1m") {
        item = list.find((m) => m.year === recordDate.getFullYear() && m.month === recordDate.getMonth() && m.date === recordDate.getDate());
      } else {
        item = list.find((m) => m.year === recordDate.getFullYear() && m.month === recordDate.getMonth());
      }
      
      if (item) {
        if (record.type === "income") {
          item.pemasukan += record.amount;
        } else {
          item.pengeluaran += record.amount;
        }
      }
    });

    list.forEach((item) => {
      item.tabungan = item.pemasukan - item.pengeluaran;
    });

    return list;
  }, [financeRecords, trendFilter]);

  const trendTotals = useMemo(() => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    trendData.forEach((item) => {
      totalPemasukan += item.pemasukan;
      totalPengeluaran += item.pengeluaran;
    });
    return {
      totalPemasukan,
      totalPengeluaran,
      totalTabungan: totalPemasukan - totalPengeluaran,
    };
  }, [trendData]);

  const [activeExpenseIndex, setActiveExpenseIndex] = useState<number>(-1);
  const [activeIncomeIndex, setActiveIncomeIndex] = useState<number>(-1);

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 12}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="font-bold text-[10px]">
          {payload.name}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="font-medium text-[9px]">
          {`Rp ${value.toLocaleString("id-ID")} (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  // Helper to get color for a category
  const getCategoryColor = (catName: string, catType: "income" | "expense") => {
    if (financeCategoryPrefs[catName]?.color)
      return financeCategoryPrefs[catName].color;
    // Distinct, vibrant, legible colors for brutalist theme
    const COLORS_EXPENSE = [
      "#FF4500",
      "#D81B60",
      "#8E24AA",
      "#1E88E5",
      "#00897B",
      "#43A047",
      "#E53935",
      "#3949AB",
    ];
    const COLORS_INCOME = [
      "#00C853",
      "#2962FF",
      "#FFAB00",
      "#C51162",
      "#00BFA5",
      "#FF6D00",
      "#6200EA",
      "#AEEA00",
    ];

    const colors = catType === "income" ? COLORS_INCOME : COLORS_EXPENSE;
    // Consistent color derived from name string hash
    let hash = 0;
    for (let i = 0; i < catName.length; i++) {
      hash = catName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getCategoryIcon = (catName: string, catType: "income" | "expense") => {
    if (financeCategoryPrefs[catName]?.iconName)
      return financeCategoryPrefs[catName].iconName;
    return (
      categoryToIcon[catName] ||
      (catType === "income" ? "TrendingUp" : "TrendingDown")
    );
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    payload,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    // Push labels further out to avoid overlapping with the chart lines
    const radius = outerRadius + 35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.02) return null; // Increased threshold to 2% for better clarity

    const actualName = payload?.payload?.name || name || payload?.name;
    const isExpense = expenseData.some((d) => d.name === actualName);
    const catType = isExpense ? "expense" : "income";
    const prefIcon =
      financeCategoryPrefs[actualName]?.iconName ||
      categoryToIcon[actualName] ||
      (catType === "income" ? "TrendingUp" : "TrendingDown");
    const color =
      financeCategoryPrefs[actualName]?.color ||
      getCategoryColor(actualName, catType);
    const IconProps =
      (LucideIcons as any)[prefIcon] ||
      (catType === "income" ? TrendingUp : TrendingDown);

    return (
      <g className="pointer-events-none">
        {/* Connection line */}
        <line
          x1={cx + outerRadius * Math.cos(-midAngle * RADIAN)}
          y1={cy + outerRadius * Math.sin(-midAngle * RADIAN)}
          x2={cx + (outerRadius + 15) * Math.cos(-midAngle * RADIAN)}
          y2={cy + (outerRadius + 15) * Math.sin(-midAngle * RADIAN)}
          stroke={color}
          strokeWidth={1}
          opacity={0.3}
        />
        <foreignObject x={x - 14} y={y - 14} width={28} height={28}>
          <div
            className="flex items-center justify-center bg-white rounded-full w-full h-full border-2 shadow-sm transition-transform hover:scale-110"
            style={{ borderColor: color, color }}
          >
            <IconProps className="w-3.5 h-3.5" />
          </div>
        </foreignObject>
        <text
          x={x}
          y={y + 24}
          fill={color}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="900"
          className="font-sans tracking-widest"
        >
          {`${(percent * 100).toFixed(0)}%`}
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
          <p className="font-bold tracking-tight">
            Rp {data.value.toLocaleString("id-ID")}
          </p>
          <p className="text-stone-400 text-xs mt-1">
            {data.displayPercent}% dari total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p1 = payload[0];
      const p2 = payload[1];
      const val1 = p1 ? p1.value : 0;
      const val2 = p2 ? p2.value : 0;
      return (
        <div className="bg-stone-900 text-white p-4 rounded-2xl border border-stone-800 shadow-xl space-y-1.5 font-sans">
          <p className="font-mono text-xs text-stone-400 font-black uppercase tracking-wider">{label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center gap-6 justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-stone-200">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}:
              </span>
              <span className="font-mono font-bold text-stone-100">
                Rp {p.value.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
          {payload.length >= 2 && (
            <div className="border-t border-stone-800 mt-2 pt-1.5 flex items-center justify-between text-xs">
              <span className="font-bold text-yellow-400">Net Tabungan:</span>
              <span className="font-mono font-bold text-yellow-400">
                Rp {(val1 - val2).toLocaleString("id-ID")}
              </span>
            </div>
          )}
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
              onClick={() => {
                setActiveTab("records");
                playClick();
              }}
              className={cn(
                "flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all",
                activeTab === "records"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700",
              )}
            >
              <ListFilter className="w-4 h-4" /> Pencatatan
            </button>
            <button
              onClick={() => {
                setActiveTab("analysis");
                playClick();
              }}
              className={cn(
                "flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all",
                activeTab === "analysis"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700",
              )}
            >
              <BarChart3 className="w-4 h-4" /> Analisis
            </button>
            <button
              onClick={() => {
                setActiveTab("planning");
                playClick();
              }}
              className={cn(
                "flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all",
                activeTab === "planning"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700",
              )}
            >
              <TrendingUp className="w-4 h-4" /> Perencanaan
            </button>
            <button
              onClick={() => {
                setActiveTab("settings");
                playClick();
              }}
              className={cn(
                "flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all",
                activeTab === "settings"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700",
              )}
            >
              <Settings className="w-4 h-4" /> Kategori & Grup
            </button>
          </div>

          <ActionMenu
            items={[

              {
                label: "AI Input Finance",
                icon: <Sparkles className="w-4 h-4" />,
                onClick: () => setShowAIModal(true),
              },
              {
                label: "Cetak Laporan Keuangan",
                icon: <Printer className="w-4 h-4" />,
                onClick: () => {
                  setShowPrintView(true);
                  playClick();
                },
              },
              {
                label: "Ekspor Akun Workspace",
                icon: <Download className="w-4 h-4" />,
                onClick: () => setShowSyncModal(true),
              },
              {
                label: "Load Data Histori",
                icon: <CheckCircle2 className="w-4 h-4" />,
                onClick: loadBulkData,
              },
              {
                label: hideAmounts ? "Tampilkan Saldo" : "Sembunyi Saldo",
                icon: hideAmounts ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                ),
                onClick: () => {
                  setHideAmounts(!hideAmounts);
                  playClick();
                },
              },
            ]}
          />
        </div>
      </header>

      {activeTab === "records" ? (
        <div className="space-y-8">
          <div className="w-full">
            <div className="bg-stone-900 text-white rounded-[2rem] p-6 shadow-brutal relative overflow-hidden group border-2 border-stone-900">
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-stone-400 uppercase tracking-widest text-[9px] font-black">
                      Net Tabungan
                    </p>
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        balance >= 0
                          ? "bg-green-400"
                          : "bg-red-400 animate-pulse",
                      )}
                    />
                  </div>
                  <h2 className="font-mono text-2xl font-bold tracking-tight">
                    {hideAmounts
                      ? "Rp •••••••"
                      : `Rp ${balance.toLocaleString("id-ID")}`}
                  </h2>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-right">
                    <p className="text-stone-400 text-[8px] uppercase font-black tracking-widest mb-0.5">Pemasukan</p>
                    <p className="font-mono font-bold text-xs text-green-400">
                      {hideAmounts ? "Rp •••" : `Rp ${totalIncome.toLocaleString("id-ID")}`}
                    </p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-4">
                    <p className="text-stone-400 text-[8px] uppercase font-black tracking-widest mb-0.5">Pengeluaran</p>
                    <p className="font-mono font-bold text-xs text-red-400">
                      {hideAmounts ? "Rp •••" : `Rp ${totalExpense.toLocaleString("id-ID")}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {false && (
              <form
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
                    onClick={() => {
                      setType("expense");
                      setCategory("");
                      playClick();
                    }}
                    className={cn(
                      "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all",
                      type === "expense"
                        ? "bg-red-600 text-white shadow-lg shadow-red-200"
                        : "text-stone-400 hover:text-stone-600",
                    )}
                  >
                    <Minus className="w-4 h-4" /> Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType("income");
                      setCategory("");
                      playClick();
                    }}
                    className={cn(
                      "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all",
                      type === "income"
                        ? "bg-green-600 text-white shadow-lg shadow-green-200"
                        : "text-stone-400 hover:text-stone-600",
                    )}
                  >
                    <Plus className="w-4 h-4" /> Pemasukan
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">
                      Jumlah
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-black text-sm">
                        Rp
                      </span>
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                              Kalkulator Mini
                            </span>
                            <button
                              onClick={() => setShowCalc(false)}
                              className="text-stone-400 hover:text-stone-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={calcValue}
                            readOnly
                            className="w-full bg-stone-50 rounded-xl p-3 text-right text-xl font-bold tracking-tight mb-4 focus:outline-none"
                          />
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              "7",
                              "8",
                              "9",
                              "/",
                              "4",
                              "5",
                              "6",
                              "*",
                              "1",
                              "2",
                              "3",
                              "-",
                              "C",
                              "0",
                              ".",
                              "+",
                            ].map((btn) => (
                              <button
                                type="button"
                                key={btn}
                                onClick={() => {
                                  if (btn === "C") setCalcValue("0");
                                  else {
                                    setCalcValue((prev) =>
                                      prev === "0" ? btn : prev + btn,
                                    );
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
                                  const val = new Function(
                                    "return " + calcValue,
                                  )();
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
                    <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2 font-sans">
                      Kategori & Ikon
                    </label>
                    <div className="flex gap-2">
                      <div className="relative group/category flex-1">
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            setShowCatDropdown(true);
                            // Auto set icon if mapped
                            const prefIcon = getCategoryIcon(
                              e.target.value,
                              type,
                            );
                            if (
                              prefIcon &&
                              prefIcon !== "TrendingUp" &&
                              prefIcon !== "TrendingDown"
                            ) {
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
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setShowCatDropdown(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-3xl shadow-2xl z-30 max-h-60 overflow-y-auto p-2"
                              >
                                <div className="grid grid-cols-1 gap-1">
                                  {categorySuggestions
                                    .filter((c) =>
                                      c
                                        .toLowerCase()
                                        .includes(category.toLowerCase()),
                                    )
                                    .map((cat, i) => {
                                      const catColor = getCategoryColor(
                                        cat,
                                        type,
                                      );
                                      const group = categoryToGroup[cat];
                                      const iconName = getCategoryIcon(
                                        cat,
                                        type,
                                      );
                                      const IconComp = iconName
                                        ? (LucideIcons as any)[iconName]
                                        : null;

                                      return (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => {
                                            setCategory(cat);
                                            if (iconName)
                                              setSelectedIcon(iconName);
                                            setShowCatDropdown(false);
                                            playClick();
                                          }}
                                          className="text-left px-4 py-3 rounded-2xl hover:bg-stone-50 transition-colors flex items-center justify-between"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div
                                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs"
                                              style={{
                                                backgroundColor: catColor,
                                              }}
                                            >
                                              {IconComp ? (
                                                <IconComp className="w-4 h-4" />
                                              ) : (
                                                cat[0].toUpperCase()
                                              )}
                                            </div>
                                            <div>
                                              <p className="font-bold text-sm text-stone-800">
                                                {cat}
                                              </p>
                                              {group && (
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                                  {group}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <ArrowRight className="w-4 h-4 text-stone-200" />
                                        </button>
                                      );
                                    })}
                                  {categorySuggestions.filter((c) =>
                                    c
                                      .toLowerCase()
                                      .includes(category.toLowerCase()),
                                  ).length === 0 && (
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
                            const Icon =
                              (LucideIcons as any)[selectedIcon] || Tag;
                            return <Icon className="w-6 h-6 text-stone-900" />;
                          })()}
                        </button>

                        <AnimatePresence>
                          {showIconPicker && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setShowIconPicker(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute bottom-full right-0 mb-4 bg-white border border-stone-200 rounded-3xl shadow-2xl p-4 z-40 w-[280px]"
                              >
                                <div className="flex items-center justify-between mb-4 px-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                                    Pilih Ikon
                                  </span>
                                  <button
                                    onClick={() => setShowIconPicker(false)}
                                    className="text-stone-300 hover:text-stone-900"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                                  {Array.from(
                                    new Set([
                                      "Utensils",
                                      "Coffee",
                                      "Pizza",
                                      "Sandwich",
                                      "Beer",
                                      "Fuel",
                                      "ShoppingBag",
                                      "Smartphone",
                                      "Zap",
                                      "Droplet",
                                      "Wifi",
                                      "Pocket",
                                      "Tag",
                                      "Wallet",
                                      "CreditCard",
                                      "Banknote",
                                      "Coins",
                                      "Briefcase",
                                      "Home",
                                      "Car",
                                      "Bus",
                                      "Plane",
                                      "Train",
                                      "Bike",
                                      "MapPin",
                                      "User",
                                      "Heart",
                                      "Star",
                                      "Smile",
                                      "Camera",
                                      "Film",
                                      "Tv",
                                      "Music",
                                      "Gamepad",
                                      "Laptop",
                                      "Headphones",
                                      "Gift",
                                      "PartyPopper",
                                      "Sprout",
                                      "Stethoscope",
                                      "Pill",
                                      "Gamepad2",
                                      "Brush",
                                      "Palette",
                                      "Cloud",
                                      "Sun",
                                      "Moon",
                                      "Bell",
                                      "Mail",
                                      "Users",
                                      "Scissors",
                                      "Ticket",
                                      "Dumbbell",
                                      "Globe",
                                    ]),
                                  ).map((iconName) => {
                                    const IconComp =
                                      (LucideIcons as any)[iconName] || Tag;
                                    return (
                                      <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => {
                                          setSelectedIcon(iconName);
                                          setShowIconPicker(false);
                                          playClick();
                                        }}
                                        className={cn(
                                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                          selectedIcon === iconName
                                            ? "bg-stone-900 text-white shadow-lg"
                                            : "hover:bg-stone-50 text-stone-400",
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
                    <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">
                      Catatan
                    </label>
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
              </form>
            )}
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
                  { value: "custom", label: "Rentang Tanggal" },
                ]}
                onChange={(val) => setFilterRange(val)}
                icon={<Calendar className="w-4 h-4" />}
              />
              {filterRange === "custom" && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-paper border border-stone-200 rounded-2xl px-4 py-3 font-bold text-sm text-stone-700 outline-none focus:border-stone-400"
                  />
                  <span className="self-center font-bold text-stone-400">
                    -
                  </span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-paper border border-stone-200 rounded-2xl px-4 py-3 font-bold text-sm text-stone-700 outline-none focus:border-stone-400"
                  />
                </div>
              )}
              <CustomDropdown
                value={filterCategory}
                options={[
                  {
                    value: "All",
                    label: "Semua Kategori",
                    iconComponent: <Filter className="w-4 h-4" />,
                  },
                  ...allCategories.map((cat) => {
                    const isIncome = incomeData.some((d) => d.name === cat);
                    const iconName = getCategoryIcon(
                      cat,
                      isIncome ? "income" : "expense",
                    );
                    const Icon = iconName
                      ? (LucideIcons as any)[iconName]
                      : null;
                    return {
                      value: cat,
                      label: cat,
                      iconComponent: Icon ? <Icon className="w-4 h-4" /> : null,
                    };
                  }),
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
                  <h3 className="font-bold text-stone-900">
                    Belum ada catatan
                  </h3>
                  <p className="text-stone-400 text-sm">
                    Tidak ditemukan transaksi untuk filter ini.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedRecordsByDate.map((group, groupIdx) => {
                  const dailyIncome = group.records
                    .filter((r) => r.type === "income")
                    .reduce((s, r) => s + r.amount, 0);
                  const dailyExpense = group.records
                    .filter((r) => r.type === "expense")
                    .reduce((s, r) => s + r.amount, 0);
                  const dateKey = format(group.date, "yyyy-MM-dd");
                  const isExpanded = expandedDates[dateKey] !== false; // Default expanded

                  return (
                    <section
                      key={groupIdx}
                      className="bg-paper border-2 border-obsidian rounded-3xl shadow-brutal-sm mb-6"
                    >
                      <button
                        onClick={() => toggleDateExpansion(group.date)}
                        className={cn(
                          "w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-all group rounded-t-3xl",
                          isExpanded && "border-b-2 border-obsidian",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "p-2 rounded-xl transition-colors",
                              isExpanded
                                ? "bg-stone-900 text-white"
                                : "bg-stone-100 text-stone-400",
                            )}
                          >
                            <ChevronDown
                              className={cn(
                                "w-5 h-5 transition-transform",
                                !isExpanded && "-rotate-90",
                              )}
                            />
                          </div>
                          <h3 className="font-bold font-serif text-xl text-stone-900">
                            {format(group.date, "EEEE, d MMM yyyy", {
                              locale: id,
                            })}
                          </h3>
                        </div>
                        <div className="flex gap-6 items-center">
                          <div className="flex flex-col items-end">
                            {dailyIncome > 0 && (
                              <span className="text-green-600 font-bold text-sm tracking-tight">
                                {hideAmounts
                                  ? "+Rp •••"
                                  : `+Rp ${dailyIncome.toLocaleString("id-ID")}`}
                              </span>
                            )}
                            {dailyExpense > 0 && (
                              <span className="text-red-500 font-bold text-sm tracking-tight">
                                {hideAmounts
                                  ? "-Rp •••"
                                  : `-Rp ${dailyExpense.toLocaleString("id-ID")}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className="divide-y divide-stone-100/60">
                              {group.records.map((record) => (
                                <div
                                  key={record.id}
                                  className="p-5 flex items-center justify-between hover:bg-stone-50 transition-all group relative focus-within:z-[50] group-hover:z-[40] z-0"
                                >
                                  <div
                                    className="absolute left-0 top-0 bottom-0 w-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                    style={{
                                      backgroundColor: getCategoryColor(
                                        record.category,
                                        record.type,
                                      ),
                                    }}
                                  />
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div
                                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-110"
                                      style={{
                                        backgroundColor: getCategoryColor(
                                          record.category,
                                          record.type,
                                        ),
                                      }}
                                    >
                                      {(() => {
                                        const Icon = record.iconName
                                          ? (LucideIcons as any)[
                                              record.iconName
                                            ] ||
                                            (record.type === "income"
                                              ? TrendingUp
                                              : Minus)
                                          : record.type === "income"
                                            ? TrendingUp
                                            : Minus;
                                        return <Icon className="w-5 h-5" />;
                                      })()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-black text-stone-900 truncate tracking-tight">
                                          {record.category}
                                        </p>
                                        <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                                          {categoryToGroup[record.category] ||
                                            "-"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-stone-400 font-medium whitespace-nowrap">
                                          {format(record.createdAt, "d MMM yyyy, HH:mm", { locale: id })}
                                        </p>
                                        {record.note && (
                                          <p className="text-xs text-stone-500 truncate italic">
                                            — {record.note}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <p
                                      className={cn(
                                        "font-black text-lg tracking-tighter text-right",
                                        record.type === "income"
                                          ? "text-green-600"
                                          : "text-red-600",
                                      )}
                                    >
                                      {hideAmounts
                                        ? "Rp •••"
                                        : `${record.type === "income" ? "+" : "-"}Rp ${record.amount.toLocaleString("id-ID")}`}
                                    </p>
                                    <ActionMenu
                                      items={[
                                        {
                                          label: "Ubah Data",
                                          icon: <Edit3 className="w-4 h-4" />,
                                          onClick: () => {
                                            setEditingRecord(record);
                                            setShowAddModal(true);
                                          },
                                        },
                                        {
                                          label: "Hapus",
                                          icon: <Trash2 className="w-4 h-4" />,
                                          onClick: () =>
                                            showConfirm(
                                              "Hapus transaksi ini?",
                                              () => {
                                                deleteFinanceRecord(record.id);
                                                playError();
                                              },
                                            ),
                                          variant: "danger",
                                        },
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
      ) : activeTab === "analysis" ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex bg-stone-50 p-1.5 rounded-2xl border border-stone-200 max-w-fit mx-auto mt-2">
            <button
              onClick={() => setChartMode("grouped")}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                chartMode === "grouped"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600",
              )}
            >
              Berdasarkan Grup
            </button>
            <button
              onClick={() => setChartMode("detail")}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                chartMode === "detail"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600",
              )}
            >
              Semua Detail
            </button>
          </div>

          {/* Tren Aliran Kas (6 Bulan Terakhir) */}
          <div className="bg-paper rounded-[2.5rem] border-2 border-stone-950 p-6 md:p-8 shadow-brutal flex flex-col space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Tren Aliran Kas
                  </h3>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-0.5">
                    Laporan pergerakan arus kas masuk (pemasukan) dan keluar (pengeluaran).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={trendFilter}
                  onChange={(e) => setTrendFilter(e.target.value as any)}
                  className="bg-paper text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 border-stone-200 outline-none hover:border-stone-400 focus:border-stone-900 transition-colors cursor-pointer"
                >
                  <option value="1m">30 Hari</option>
                  <option value="6m">6 Bulan</option>
                  <option value="1y">1 Tahun</option>
                </select>
                <span className="text-[10px] uppercase font-black tracking-widest bg-stone-900 text-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-sm hidden sm:block">
                  Metrik Real-time
                </span>
              </div>
            </header>

            {/* Metric Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Pemasukan</span>
                  </div>
                  <p className="text-2xl font-black text-stone-900 tracking-tight">
                    Rp {trendTotals.totalPemasukan.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-3">Akumulasi Arus Masuk</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Pengeluaran</span>
                  </div>
                  <p className="text-2xl font-black text-stone-900 tracking-tight">
                    Rp {trendTotals.totalPengeluaran.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-3">Akumulasi Arus Keluar</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Net Tabungan (Selisih)</span>
                  </div>
                  <p className={cn(
                    "text-2xl font-black tracking-tight",
                    trendTotals.totalTabungan >= 0 ? "text-emerald-700" : "text-rose-700"
                  )}>
                    {trendTotals.totalTabungan >= 0 ? "+" : ""}Rp {trendTotals.totalTabungan.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-3">Kondisi Neraca 6 Bulan</p>
              </div>
            </div>

            {/* Line Chart Component */}
            <div className="w-full h-[350px] min-w-0 bg-white/40 p-4 rounded-3xl border border-stone-200">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 25, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#44403c', fontSize: 10, fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#2F343D', strokeWidth: 1.5 }}
                    tickLine={{ stroke: '#2F343D' }}
                  />
                  <YAxis 
                    tick={{ fill: '#44403c', fontSize: 10, fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#2F343D', strokeWidth: 1.5 }}
                    tickLine={{ stroke: '#2F343D' }}
                    tickFormatter={(val) => `Rp ${val >= 1000000 ? (val/1000000).toFixed(1) + 'jt' : val >= 1000 ? (val/1000).toFixed(0) + 'rb' : val}`}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    formatter={(value: any) => <span className="text-xs font-black uppercase tracking-wider text-stone-700">{value}</span>}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pemasukan" 
                    name="Pemasukan" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    activeDot={{ r: 8, strokeWidth: 2, fill: '#10b981' }}
                    dot={{ r: 4, strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pengeluaran" 
                    name="Pengeluaran" 
                    stroke="#ef4444" 
                    strokeWidth={4}
                    activeDot={{ r: 8, strokeWidth: 2, fill: '#ef4444' }}
                    dot={{ r: 4, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-paper rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm flex flex-col">
              <header className="w-full flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                     <TrendingDown className="w-4 h-4" />
                  </div>
                  Distribusi Pengeluaran
                </h3>
              </header>
              <div className="w-full h-[400px] min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <Pie
                      activeIndex={activeExpenseIndex}
                      activeShape={renderActiveShape}
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="35%"
                      outerRadius="55%"
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      onClick={(data, index) => {
                        setActiveExpenseIndex(activeExpenseIndex === index ? -1 : index);
                        handleChartClick(data, "expense");
                      }}
                      className="cursor-pointer"
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "Lainnya"
                              ? "#a8a29e"
                              : getCategoryColor(entry.name, "expense")
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-3 max-h-[500px] overflow-y-auto px-1 custom-scrollbar">
                <div className="sticky top-0 bg-paper pt-2 pb-4 z-10">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-stone-400 px-2">
                    Analisis Kategori
                  </h4>
                </div>
                {expenseData.length === 0 ? (
                  <p className="text-center text-stone-400 text-sm font-bold py-8">
                    Belum ada data pengeluaran.
                  </p>
                ) : (
                  expenseData.map((data, i) => {
                    const pref = financeCategoryPrefs[data.name];
                    const iconName =
                      pref?.iconName || getCategoryIcon(data.name, "expense");
                    const Icon = (LucideIcons as any)[iconName] || TrendingDown;
                    const catColor =
                      pref?.color || getCategoryColor(data.name, "expense");
                    return (
                      <div
                        id={`detail-expense-${data.name}${parseFloat(data.displayPercent) < 3 ? "-Lainnya-Header" : ""}`}
                        key={i}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-3xl transition-all group border bg-white shadow-sm mb-3",
                          highlightedCategory === data.name ||
                            (highlightedCategory === "Lainnya" &&
                              parseFloat(data.displayPercent) < 3)
                            ? "bg-stone-50 border-stone-900 ring-4 ring-stone-900/5 scale-[1.02] shadow-md"
                            : "border-stone-100 hover:border-stone-300 shadow-sm hover:shadow-md",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                            style={{ backgroundColor: catColor }}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">
                              {data.name}
                            </p>
                            <div className="text-[10px] font-black tracking-widest uppercase text-stone-400 opacity-60 flex items-center gap-1.5">
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: catColor }}
                              />
                              {data.displayPercent}% dari Total
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-base tracking-tight text-stone-900">
                            Rp {data.value.toLocaleString("id-ID")}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">
                            Pengeluaran
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-paper rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm flex flex-col">
              <header className="w-full flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                     <TrendingUp className="w-4 h-4" />
                  </div>
                  Distribusi Pemasukan
                </h3>
              </header>
              <div className="w-full h-[400px] min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <Pie
                      activeIndex={activeIncomeIndex}
                      activeShape={renderActiveShape}
                      data={incomeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="35%"
                      outerRadius="55%"
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      onClick={(data, index) => {
                        setActiveIncomeIndex(activeIncomeIndex === index ? -1 : index);
                        handleChartClick(data, "income");
                      }}
                      className="cursor-pointer"
                    >
                      {incomeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "Lainnya"
                              ? "#a8a29e"
                              : getCategoryColor(entry.name, "income")
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-3 max-h-[500px] overflow-y-auto px-1 custom-scrollbar">
                <div className="sticky top-0 bg-paper pt-2 pb-4 z-10">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-stone-400 px-2">
                    Analisis Kategori
                  </h4>
                </div>
                {incomeData.length === 0 ? (
                  <p className="text-center text-stone-400 text-sm font-bold py-8">
                    Belum ada data pemasukan.
                  </p>
                ) : (
                  incomeData.map((data, i) => {
                    const pref = financeCategoryPrefs[data.name];
                    const iconName =
                      pref?.iconName || getCategoryIcon(data.name, "income");
                    const Icon = (LucideIcons as any)[iconName] || TrendingUp;
                    const catColor =
                      pref?.color || getCategoryColor(data.name, "income");
                    return (
                      <div
                        id={`detail-income-${data.name}${parseFloat(data.displayPercent) < 3 ? "-Lainnya-Header" : ""}`}
                        key={i}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-3xl transition-all group border bg-white shadow-sm mb-3",
                          highlightedCategory === data.name ||
                            (highlightedCategory === "Lainnya" &&
                              parseFloat(data.displayPercent) < 3)
                            ? "bg-stone-50 border-stone-900 ring-4 ring-stone-900/5 scale-[1.02] shadow-md"
                            : "border-stone-100 hover:border-stone-300 shadow-sm hover:shadow-md",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                            style={{ backgroundColor: catColor }}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">
                              {data.name}
                            </p>
                            <div className="text-[10px] font-black tracking-widest uppercase text-stone-400 opacity-60 flex items-center gap-1.5">
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: catColor }}
                              />
                              {data.displayPercent}% dari Total
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-base tracking-tight text-stone-900">
                            Rp {data.value.toLocaleString("id-ID")}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">
                            Pemasukan
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "planning" ? (
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
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                      Kontrol Pengeluaran
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const nameEl = document.getElementById("budget-form");
                    if (nameEl) nameEl.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-5 h-5 text-stone-700" />
                </button>
              </div>

              {/* Budget Form */}
              <div
                id="budget-form"
                className="p-6 bg-stone-50 rounded-3xl border border-stone-200/50 space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">
                      Kategori
                    </label>
                    <input
                      id="new-budget-cat"
                      type="text"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="Cth. Makanan"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">
                      Nominal
                    </label>
                    <input
                      id="new-budget-amt"
                      type="number"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-stone-900"
                      placeholder="0"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const c = (
                      document.getElementById(
                        "new-budget-cat",
                      ) as HTMLInputElement
                    ).value;
                    const a = (
                      document.getElementById(
                        "new-budget-amt",
                      ) as HTMLInputElement
                    ).value;
                    if (c && a) {
                      addBudget({
                        id: uuidv4(),
                        category: c,
                        amount: parseFloat(a),
                        period: "monthly",
                        createdAt: Date.now(),
                      });
                      (
                        document.getElementById(
                          "new-budget-cat",
                        ) as HTMLInputElement
                      ).value = "";
                      (
                        document.getElementById(
                          "new-budget-amt",
                        ) as HTMLInputElement
                      ).value = "";
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
                    <p className="text-stone-400 italic text-sm">
                      Belum ada anggaran.
                    </p>
                  </div>
                ) : (
                  budgets.map((b) => (
                    <div
                      key={b.id}
                      className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex items-center justify-between hover:border-stone-300 transition-all group"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">
                          {b.category}
                        </p>
                        <p className="font-black text-2xl text-stone-900 tracking-tighter">
                          Rp {b.amount.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            showConfirm(
                              `Hapus anggaran "${b.category}"?`,
                              () => {
                                deleteBudget(b.id);
                                playError();
                              },
                            )
                          }
                          className="p-3 text-stone-300 hover:text-red-500 hover:bg-white rounded-2xl transition-all opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-paper p-8 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                <Heart className="w-48 h-48" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-100/50 ring-4 ring-teal-50">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Tabungan</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                      Simpanan & Investasi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById("saving-form");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-5 h-5 text-stone-700" />
                </button>
              </div>

              {/* Saving Form */}
              <div
                id="saving-form"
                className="p-6 bg-teal-50/10 rounded-3xl border border-teal-100/60 space-y-4 relative z-10"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-600 pl-1">
                      Nama Simpanan
                    </label>
                    <input
                      id="new-saving-name"
                      type="text"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Cth. Dana Darurat"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-600 pl-1">
                      Saldo
                    </label>
                    <input
                      id="new-saving-amt"
                      type="number"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-600 pl-1">
                      Target (Ops)
                    </label>
                    <input
                      id="new-saving-target"
                      type="number"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const n = (
                      document.getElementById(
                        "new-saving-name",
                      ) as HTMLInputElement
                    ).value;
                    const s = (
                      document.getElementById(
                        "new-saving-amt",
                      ) as HTMLInputElement
                    ).value;
                    const t = (
                      document.getElementById(
                        "new-saving-target",
                      ) as HTMLInputElement
                    ).value;
                    if (n && s) {
                      addSaving({
                        id: uuidv4(),
                        name: n,
                        currentAmount: parseFloat(s),
                        targetAmount: parseFloat(t || "0"),
                        location: "Bank",
                        createdAt: Date.now(),
                      });
                      (
                        document.getElementById(
                          "new-saving-name",
                        ) as HTMLInputElement
                      ).value = "";
                      (
                        document.getElementById(
                          "new-saving-amt",
                        ) as HTMLInputElement
                      ).value = "";
                      (
                        document.getElementById(
                          "new-saving-target",
                        ) as HTMLInputElement
                      ).value = "";
                      playSuccess();
                    }
                  }}
                  className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold transition-all hover:bg-teal-700 shadow-lg shadow-teal-100/30"
                >
                  Buka Tabungan Baru
                </button>
              </div>

              <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto px-1 custom-scrollbar relative z-10">
                {savings.length === 0 ? (
                  <div className="text-center py-20 bg-stone-50/50 rounded-3xl border border-stone-100 border-dashed">
                    <p className="text-stone-400 italic text-sm">
                      Belum ada catatan simpanan.
                    </p>
                  </div>
                ) : (
                  savings.map((s) => (
                    <div
                      key={s.id}
                      className="p-6 bg-white rounded-3xl border border-stone-100 relative group overflow-hidden shadow-sm hover:border-teal-200 transition-all"
                    >
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded text-[9px] font-black uppercase tracking-widest">
                              {s.location}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-stone-300" />
                            <p className="text-xs font-bold text-stone-900">
                              {s.name}
                            </p>
                          </div>
                          <p className="font-black text-2xl text-stone-900 tracking-tighter">
                            Rp {s.currentAmount.toLocaleString("id-ID")}
                          </p>

                          {s.targetAmount > 0 && (
                            <div className="mt-4 space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-stone-400">
                                  Target: Rp{" "}
                                  {s.targetAmount.toLocaleString("id-ID")}
                                </span>
                                <span className="text-teal-600 font-bold">
                                  {Math.min(
                                    100,
                                    Math.round(
                                      (s.currentAmount / s.targetAmount) * 100,
                                    ),
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-50">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.min(100, (s.currentAmount / s.targetAmount) * 100)}%`,
                                  }}
                                  className="h-full bg-teal-600 rounded-full shadow-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-4 transition-opacity">
                          <button
                            onClick={() => {
                              const newAmt = null as any;
                              setUpdateBalanceSavingId(s.id);
                              setNewBalanceModalValue(
                                s.currentAmount.toString(),
                              );
                              setShowUpdateBalanceModal(true);
                              playClick();
                              if (newAmt) {
                                updateSaving({
                                  ...s,
                                  currentAmount: parseFloat(newAmt),
                                });
                                playSuccess();
                              }
                            }}
                            className="p-2.5 bg-stone-50 text-stone-400 hover:text-stone-900 rounded-xl transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              showConfirm(`Hapus tabungan "${s.name}"?`, () => {
                                deleteSaving(s.id);
                                playError();
                              })
                            }
                            className="p-2.5 bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      ) : activeTab === "settings" ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
          {/* Card Box 1: Kustomisasi Kategori */}
          <div className="bg-paper border border-stone-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm border-2">
            <header className="mb-12">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-stone-900">
                  Kustomisasi Kategori
                </h2>
              </div>
              <p className="text-stone-500 text-sm">
                Kelola visual, warna, dan ikon serta sesuaikan nama untuk masing-masing kategori transaksi keuangan Anda.
              </p>
            </header>

            <section>
              <div className="mb-8">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAddCatModalTargetGroup(null);
                      setNewCatModalName("");
                      setShowAddCategoryModal(true);
                      playClick();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 text-stone-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white border border-stone-200 hover:border-stone-900 transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> Kategori Baru
                  </button>
                  <button
                    onClick={() => {
                      Object.keys(categoryEdits).forEach((oldCat) => {
                        const edits = categoryEdits[oldCat];
                        updateCategoryPref(oldCat, {
                          iconName: edits.iconName,
                          color: edits.color,
                        });
                        if (edits.name !== oldCat && edits.name.trim()) {
                          updateFinanceCategoryBulk(oldCat, edits.name.trim());
                        }
                      });
                      setCategoryEdits({});
                      playSuccess();
                      setAlert("Perubahan kategori disimpan");
                    }}
                    className="flex items-center gap-1 px-4 py-1.5 bg-stone-900 text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-stone-800 transition-all active:scale-95 shadow-md shadow-stone-200"
                  >
                    <Save className="w-2.5 h-2.5" /> Simpan Perubahan
                  </button>
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={settingsSearch}
                  onChange={(e) => setSettingsSearch(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-stone-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCategories
                  .filter((cat) =>
                    cat.toLowerCase().includes(settingsSearch.toLowerCase()),
                  )
                  .map((cat) => {
                    const isIncome =
                      financeRecords.find((r) => r.category === cat)?.type ===
                      "income";
                    const editObj = getCatEdit(cat, isIncome);
                    return (
                      <div
                        key={cat}
                        className="group relative bg-white border border-stone-100 p-6 rounded-[2rem] hover:border-stone-400 transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setPickingIconFor(
                                  pickingIconFor === cat ? null : cat,
                                )
                              }
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all shadow-md active:scale-90"
                              style={{ backgroundColor: editObj.color }}
                            >
                              {React.createElement(
                                (LucideIcons as any)[editObj.iconName] || Tag,
                                { className: "w-6 h-6" },
                              )}
                            </button>
                            {pickingIconFor === cat && (
                              <div className="absolute top-14 left-0 w-80 bg-white border border-stone-200 shadow-2xl rounded-[2.5rem] p-6 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                                  {ICON_GROUPS.map((group) => (
                                    <div
                                      key={group.name}
                                      className="space-y-3"
                                    >
                                      <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block mb-2">
                                        {group.name}
                                      </label>
                                      <div className="grid grid-cols-5 gap-2">
                                        {group.icons.map((iconName) => {
                                          const Ico = (LucideIcons as any)[
                                            iconName
                                          ];
                                          return (
                                            <button
                                              key={iconName}
                                              onClick={() => {
                                                setCategoryEdits((p) => ({
                                                  ...p,
                                                  [cat]: {
                                                    ...editObj,
                                                    iconName: iconName,
                                                  },
                                                }));
                                                setPickingIconFor(null);
                                              }}
                                              className={cn(
                                                "aspect-square hover:bg-stone-100 rounded-xl flex items-center justify-center text-stone-600 transition-all",
                                                editObj.iconName === iconName
                                                  ? "bg-stone-900 text-white shadow-md scale-110"
                                                  : "bg-stone-50",
                                              )}
                                            >
                                              {Ico && (
                                                <Ico className="w-4 h-4" />
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={editObj.name}
                              onChange={(e) =>
                                setCategoryEdits((p) => ({
                                  ...p,
                                  [cat]: { ...editObj, name: e.target.value },
                                }))
                              }
                              className="w-full bg-transparent font-bold text-stone-900 outline-none border-b-2 border-transparent hover:border-stone-100 focus:border-stone-900 transition-all text-lg pb-1"
                            />
                            <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mt-1">
                              ID: {cat}
                            </p>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setPickingColorFor(
                                  pickingColorFor === cat ? null : cat,
                                )
                              }
                              className="w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 active:scale-95 shrink-0"
                              style={{ backgroundColor: editObj.color }}
                            />
                            {pickingColorFor === cat && (
                              <div className="absolute top-10 right-0 w-64 bg-white border border-stone-200 shadow-2xl rounded-[2rem] p-5 z-50 animate-in fade-in zoom-in-95">
                                <div className="space-y-4">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block mb-2">
                                    Pilih Warna
                                  </label>
                                  <div className="grid grid-cols-5 gap-2">
                                    {[
                                      "#FF4500",
                                      "#D81B60",
                                      "#8E24AA",
                                      "#1E88E5",
                                      "#00897B",
                                      "#43A047",
                                      "#E53935",
                                      "#3949AB",
                                      "#FFC107",
                                      "#FF5722",
                                      "#795548",
                                      "#1c1917",
                                      "#607D8B",
                                      "#E91E63",
                                      "#9C27B0",
                                    ].map((c) => (
                                      <button
                                        key={c}
                                        onClick={() => {
                                          setCategoryEdits((p) => ({
                                            ...p,
                                            [cat]: { ...editObj, color: c },
                                          }));
                                          setPickingColorFor(null);
                                        }}
                                        className={cn(
                                          "aspect-square rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110",
                                          editObj.color === c
                                            ? "ring-2 ring-stone-900 scale-110"
                                            : "",
                                        )}
                                        style={{ backgroundColor: c }}
                                      />
                                    ))}
                                  </div>
                                  <div className="pt-4 border-t border-stone-100">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block mb-2">
                                      Custom Palette
                                    </label>
                                    <input
                                      type="color"
                                      value={editObj.color}
                                      onChange={(e) =>
                                        setCategoryEdits((p) => ({
                                          ...p,
                                          [cat]: {
                                            ...editObj,
                                            color: e.target.value,
                                          },
                                        }))
                                      }
                                      className="w-full h-8 cursor-pointer border-0 p-0 rounded-lg overflow-hidden bg-transparent"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          </div>

          {/* Card Box 2: Pengelompokan Grup Analisis */}
          <div className="bg-paper border border-stone-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm border-2">
            <header className="mb-12">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                    <Folder className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-stone-900">
                    Pengelompokan Grup Analisis
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setNewGroupModalName("");
                    setShowAddGroupModal(true);
                    playClick();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 text-stone-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white border border-stone-200 hover:border-stone-900 transition-all shadow-sm active:scale-95 animate-in fade-in"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Group
                </button>
              </div>
              <p className="text-stone-500 text-sm">
                Kelompokkan kategori keuangan Anda ke dalam grup agar laporan analisis menjadi lebih spesifik dan terorganisir.
              </p>
            </header>

            <section>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {Object.keys(financeMappings)
                  .sort()
                  .map((group) => {
                    const categoriesInGroup = financeMappings[group] || [];
                    const isManaged = managedGroup === group;
                    return (
                      <div
                        key={group}
                        className="bg-white border-2 border-stone-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group/card"
                      >
                        <header className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shadow-md group-hover/card:scale-110 transition-transform"
                              style={{ backgroundColor: "#1e293b" }}
                            >
                              <Folder className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-stone-900 tracking-tight">
                                {group}
                              </h4>
                              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                                Grup Analisis
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              showConfirm(
                                `Hapus grup "${group}"? Semua kategori di dalamnya akan menjadi tidak terkelompok.`,
                                () => {
                                  deleteFinanceMapping(group);
                                  playError();
                                },
                              );
                            }}
                            className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-55 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </header>

                        <div className="min-h-[120px] bg-stone-50 border-2 border-dashed border-stone-200 rounded-[2rem] p-6 flex flex-wrap gap-3 mb-8">
                          {categoriesInGroup.map((cat) => {
                            const catColor = getCategoryColor(cat, "expense");
                            const catIcon = getCategoryIcon(cat, "expense");
                            const Icon = (LucideIcons as any)[catIcon] || Tag;
                            return (
                              <div
                                key={cat}
                                className="group/item flex items-center gap-3 bg-white border border-stone-200 pl-3 pr-2 py-1.5 rounded-xl shadow-sm hover:border-stone-400 transition-all animate-in zoom-in-95 duration-200"
                              >
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover/item:scale-105"
                                  style={{ backgroundColor: catColor }}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-bold text-stone-700 leading-tight truncate">
                                  {cat}
                                </span>
                                <button
                                  onClick={() => {
                                    updateFinanceMapping(
                                      group,
                                      categoriesInGroup.filter(
                                        (c) => c !== cat,
                                      ),
                                    );
                                    playSuccess();
                                  }}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 text-stone-300 hover:text-stone-800 rounded-lg transition-all ml-auto shrink-0"
                                  title="Hapus dari grup"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                          {categoriesInGroup.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center py-8 text-stone-300 gap-3 opacity-50">
                              <ListFilter className="w-10 h-10" />
                              <p className="text-[10px] font-black uppercase tracking-widest">
                                Grup ini masih kosong
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setManagedGroup(isManaged ? null : group)
                            }
                            className={cn(
                              "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 border-2",
                              isManaged
                                ? "bg-white border-stone-900 text-stone-900 shadow-inner"
                                : "bg-stone-50 border-transparent text-stone-500 hover:bg-stone-100",
                            )}
                          >
                            {isManaged ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            {isManaged
                              ? "Batalkan Pemilihan"
                              : "Tambahkan Kategori"}
                          </button>

                          {isManaged && (
                            <div className="absolute top-full left-0 right-0 mt-4 p-8 bg-white border border-stone-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                              <div className="flex items-center justify-between mb-6">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-900">
                                  Pilih Kategori
                                </label>
                                <span className="text-[10px] font-bold text-stone-400">
                                  {
                                    allCategories.filter(
                                      (cat) => !categoryToGroup[cat],
                                    ).length
                                  }{" "}
                                  Tersedia
                                </span>
                              </div>

                              <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                                <input
                                  type="text"
                                  placeholder="Cari kategori tersedia..."
                                  value={selectionSearch}
                                  onChange={(e) =>
                                    setSelectionSearch(e.target.value)
                                  }
                                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:bg-white focus:border-stone-900 transition-all"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-3 mb-6">
                                {allCategories
                                  .filter(
                                    (cat) =>
                                      !categoryToGroup[cat] &&
                                      cat
                                        .toLowerCase()
                                        .includes(
                                          selectionSearch.toLowerCase(),
                                        ),
                                  )
                                  .map((cat) => (
                                    <button
                                      key={cat}
                                      onClick={() => {
                                        updateFinanceMapping(group, [
                                          ...categoriesInGroup,
                                          cat,
                                        ]);
                                        setManagedGroup(null);
                                        setSelectionSearch("");
                                        playSuccess();
                                      }}
                                      className="flex items-center gap-4 p-4 bg-stone-50 hover:bg-stone-900 hover:text-white rounded-3xl transition-all group/selector text-left border-2 border-transparent hover:border-stone-800 shadow-sm"
                                    >
                                      <div
                                        className="w-12 h-12 rounded-2xl bg-white group-hover/selector:bg-white/10 flex items-center justify-center text-white transition-all shadow-md"
                                        style={{
                                          backgroundColor: getCategoryColor(
                                            cat,
                                            "expense",
                                          ),
                                        }}
                                      >
                                        {React.createElement(
                                          (LucideIcons as any)[
                                            getCategoryIcon(cat, "expense")
                                          ] || Tag,
                                          { className: "w-6 h-6" },
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span className="font-black text-[11px] uppercase tracking-widest block truncate">
                                          {cat}
                                        </span>
                                        <span className="text-[9px] opacity-40 uppercase tracking-tighter">
                                          Klik untuk pilih
                                        </span>
                                      </div>
                                      <ChevronRight className="w-4 h-4 opacity-0 group-hover/selector:opacity-100 transition-all" />
                                    </button>
                                  ))}

                                {allCategories.filter(
                                  (cat) =>
                                    !categoryToGroup[cat] &&
                                    cat
                                      .toLowerCase()
                                      .includes(selectionSearch.toLowerCase()),
                                ).length === 0 && (
                                  <div className="col-span-1 md:col-span-2 py-12 text-center bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">
                                      Tidak ada kategori yang cocok
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="pt-6 border-t border-stone-100">
                                <p className="text-[10px] font-bold text-stone-400 mb-4 text-center">
                                  Tidak menemukan kategori? Buat baru di sini:
                                </p>
                                <button
                                  onClick={() => {
                                    setAddCatModalTargetGroup(group);
                                    setNewCatModalName("");
                                    setShowAddCategoryModal(true);
                                    playClick();
                                  }}
                                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-lg"
                                >
                                  <Plus className="w-4 h-4" /> Buat Kategori Baru & Masukkan
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
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
                    <h3 className="font-serif text-2xl font-bold">
                      Edit Kategori
                    </h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                      {editingCategory.oldName}
                    </p>
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
                  <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2 font-sans">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    value={editingCategory.newName}
                    onChange={(e) =>
                      setEditingCategory((prev) =>
                        prev ? { ...prev, newName: e.target.value } : null,
                      )
                    }
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-stone-900/5 font-bold"
                  />
                  <p className="text-[10px] text-orange-500 mt-2 italic font-medium leading-relaxed">
                    Peringatan: Mengubah nama akan mengupdate semua riwayat
                    transaksi yang menggunakan kategori ini.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-4 font-sans">
                    Pilih Ikon Baru
                  </label>
                  <div className="p-4 bg-stone-50 rounded-[2rem] border border-stone-100">
                    <div className="grid grid-cols-1 gap-6 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                      {ICON_GROUPS.map((group) => (
                        <div key={group.name} className="space-y-3">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-400 pl-1">
                            {group.name}
                          </h4>
                          <div className="grid grid-cols-6 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                            {group.icons.map((icon) => {
                              const IconComp =
                                (LucideIcons as any)[icon] || Tag;
                              const isSelected =
                                editingCategory?.iconName === icon;
                              return (
                                <button
                                  key={icon}
                                  onClick={() =>
                                    setEditingCategory((prev) =>
                                      prev ? { ...prev, iconName: icon } : null,
                                    )
                                  }
                                  className={cn(
                                    "aspect-square rounded-xl flex items-center justify-center border transition-all",
                                    isSelected
                                      ? "bg-stone-900 border-stone-900 text-white shadow-md scale-110"
                                      : "bg-white border-stone-100 text-stone-400 hover:border-stone-300",
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
                  <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-4 font-sans">
                    Warna Kategori (Hue)
                  </label>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 p-4 bg-stone-50 rounded-3xl border border-stone-100">
                      {[0, 25, 45, 80, 140, 190, 220, 270, 300, 330, 350].map(
                        (hue) => {
                          const color = `hsl(${hue}, 70%, 50%)`;
                          const isSelected = editingCategory?.color === color;
                          return (
                            <button
                              key={hue}
                              onClick={() =>
                                setEditingCategory((prev) =>
                                  prev ? { ...prev, color: color } : null,
                                )
                              }
                              className={cn(
                                "w-10 h-10 rounded-full border-4 transition-all shadow-sm active:scale-95",
                                isSelected
                                  ? "border-stone-900 scale-110"
                                  : "border-white hover:scale-105",
                              )}
                              style={{ backgroundColor: color }}
                            />
                          );
                        },
                      )}
                    </div>
                    <div className="flex gap-4 items-center">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        className="flex-1 accent-stone-900"
                        onChange={(e) => {
                          const hue = e.target.value;
                          setEditingCategory((prev) =>
                            prev
                              ? { ...prev, color: `hsl(${hue}, 70%, 50%)` }
                              : null,
                          );
                        }}
                      />
                      <div
                        className="w-12 h-12 rounded-2xl border-4 border-white shadow-xl shrink-0"
                        style={{ backgroundColor: editingCategory?.color }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (
                      !editingCategory.newName.trim() ||
                      !editingCategory.iconName.trim() ||
                      !editingCategory.color.trim()
                    ) {
                      setAlert("Harap lengkapi semua field!");
                      return;
                    }
                    if (
                      editingCategory.newName.trim() !== editingCategory.oldName
                    ) {
                      updateFinanceCategoryBulk(
                        editingCategory.oldName,
                        editingCategory.newName.trim(),
                      );
                    }
                    updateCategoryPref(editingCategory.newName.trim(), {
                      iconName: editingCategory.iconName.trim(),
                      color: editingCategory.color.trim(),
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
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                      Parse teks jadi data
                    </p>
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
                    Ketik catatanmu, AI akan memisahkan nominal, kategori, dan
                    jenis transaksi secara otomatis.
                  </p>
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-700 italic">
                    Contoh: "Beli bensin 50rb tadi pagi, trus makan siang 30rb,
                    dapet gaji 5jt"
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
                      isParsing || !aiPrompt.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-stone-800",
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

      {/* Custom Add Category Modal */}
      <AnimatePresence>
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddCategoryModal(false);
                setAddCatModalTargetGroup(null);
                setNewCatModalName("");
              }}
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
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Tambah Kategori</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                      {addCatModalTargetGroup ? `Untuk Grup: ${addCatModalTargetGroup}` : "Kategori Baru"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setAddCatModalTargetGroup(null);
                    setNewCatModalName("");
                  }}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block">
                    Nama Kategori Baru
                  </label>
                  <input
                    type="text"
                    value={newCatModalName}
                    onChange={(e) => setNewCatModalName(e.target.value)}
                    placeholder="Contoh: Makanan Ringan, Transportasi, Langganan"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const trimmed = newCatModalName.trim();
                        if (!trimmed) return;
                        if (allCategories.includes(trimmed)) {
                          setAlert("Kategori ini sudah ada!");
                          return;
                        }
                        addFinanceRecord({
                          id: uuidv4(),
                          amount: 0,
                          category: trimmed,
                          type: 'expense',
                          createdAt: Date.now(),
                          note: 'Inisialisasi kategori baru'
                        });
                        if (addCatModalTargetGroup) {
                          const currentGroupMapping = financeMappings[addCatModalTargetGroup] || [];
                          updateFinanceMapping(addCatModalTargetGroup, [...currentGroupMapping, trimmed]);
                          setManagedGroup(null);
                        }
                        playSuccess();
                        setAlert(`Kategori "${trimmed}" berhasil dibuat`);
                        setShowAddCategoryModal(false);
                        setNewCatModalName("");
                        setAddCatModalTargetGroup(null);
                      }
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowAddCategoryModal(false);
                      setAddCatModalTargetGroup(null);
                      setNewCatModalName("");
                    }}
                    className="flex-1 py-4 bg-stone-50 hover:bg-stone-100 text-stone-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      const trimmed = newCatModalName.trim();
                      if (!trimmed) return;
                      if (allCategories.includes(trimmed)) {
                        setAlert("Kategori ini sudah ada!");
                        return;
                      }
                      addFinanceRecord({
                        id: uuidv4(),
                        amount: 0,
                        category: trimmed,
                        type: 'expense',
                        createdAt: Date.now(),
                        note: 'Inisialisasi kategori baru'
                      });
                      if (addCatModalTargetGroup) {
                        const currentGroupMapping = financeMappings[addCatModalTargetGroup] || [];
                        updateFinanceMapping(addCatModalTargetGroup, [...currentGroupMapping, trimmed]);
                        setManagedGroup(null);
                      }
                      playSuccess();
                      setAlert(`Kategori "${trimmed}" berhasil dibuat`);
                      setShowAddCategoryModal(false);
                      setNewCatModalName("");
                      setAddCatModalTargetGroup(null);
                    }}
                    disabled={!newCatModalName.trim()}
                    className={cn(
                      "flex-[2] py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2",
                      !newCatModalName.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-stone-800 hover:scale-[1.02] active:scale-95 shadow-lg shadow-stone-200"
                    )}
                  >
                    <Plus className="w-4 h-4" /> Tambah Kategori
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Add Group Modal */}
      <AnimatePresence>
        {showAddGroupModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddGroupModal(false);
                setNewGroupModalName("");
              }}
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
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Tambah Grup</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                      Grup Analisis Baru
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddGroupModal(false);
                    setNewGroupModalName("");
                  }}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block">
                    Nama Grup Baru
                  </label>
                  <input
                    type="text"
                    value={newGroupModalName}
                    onChange={(e) => setNewGroupModalName(e.target.value)}
                    placeholder="Contoh: Kebutuhan Pokok, Rutinitas, Gaya Hidup"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const trimmed = newGroupModalName.trim();
                        if (!trimmed) return;
                        if (financeMappings[trimmed]) {
                          setAlert("Grup dengan nama ini sudah ada!");
                          return;
                        }
                        updateFinanceMapping(trimmed, []);
                        playSuccess();
                        setAlert(`Grup "${trimmed}" berhasil dibuat!`);
                        setShowAddGroupModal(false);
                        setNewGroupModalName("");
                      }
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowAddGroupModal(false);
                      setNewGroupModalName("");
                    }}
                    className="flex-1 py-4 bg-stone-50 hover:bg-stone-100 text-stone-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      const trimmed = newGroupModalName.trim();
                      if (!trimmed) return;
                      if (financeMappings[trimmed]) {
                        setAlert("Grup dengan nama ini sudah ada!");
                        return;
                      }
                      updateFinanceMapping(trimmed, []);
                      playSuccess();
                      setAlert(`Grup "${trimmed}" berhasil dibuat!`);
                      setShowAddGroupModal(false);
                      setNewGroupModalName("");
                    }}
                    disabled={!newGroupModalName.trim()}
                    className={cn(
                      "flex-[2] py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2",
                      !newGroupModalName.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-stone-800 hover:scale-[1.02] active:scale-95 shadow-lg shadow-stone-200"
                    )}
                  >
                    <Plus className="w-4 h-4" /> Buat Grup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Update Balance Modal */}
      <AnimatePresence>
        {showUpdateBalanceModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowUpdateBalanceModal(false);
                setUpdateBalanceSavingId(null);
                setNewBalanceModalValue("");
              }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-paper w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-stone-900 text-white rounded-2xl">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Update Saldo</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                      Edit Tabungan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUpdateBalanceModal(false);
                    setUpdateBalanceSavingId(null);
                    setNewBalanceModalValue("");
                  }}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 block">
                    Saldo Saat Ini (Rp)
                  </label>
                  <input
                    type="number"
                    value={newBalanceModalValue}
                    onChange={(e) => setNewBalanceModalValue(e.target.value)}
                    placeholder="Masukkan jumlah saldo baru"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (!updateBalanceSavingId) return;
                        const targetSaving = savings.find(s => s.id === updateBalanceSavingId);
                        if (!targetSaving) return;
                        const val = parseFloat(newBalanceModalValue);
                        if (isNaN(val)) return;
                        updateSaving({ ...targetSaving, currentAmount: val });
                        playSuccess();
                        setAlert(`Saldo untuk "${targetSaving.name}" didefinisikan kembali`);
                        setShowUpdateBalanceModal(false);
                        setUpdateBalanceSavingId(null);
                        setNewBalanceModalValue("");
                      }
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowUpdateBalanceModal(false);
                      setUpdateBalanceSavingId(null);
                      setNewBalanceModalValue("");
                    }}
                    className="flex-1 py-4 bg-stone-50 hover:bg-stone-100 text-stone-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (!updateBalanceSavingId) return;
                      const targetSaving = savings.find(s => s.id === updateBalanceSavingId);
                      if (!targetSaving) return;
                      const val = parseFloat(newBalanceModalValue);
                      if (isNaN(val)) return;
                      updateSaving({ ...targetSaving, currentAmount: val });
                      playSuccess();
                      setAlert(`Saldo untuk "${targetSaving.name}" didefinisikan kembali`);
                      setShowUpdateBalanceModal(false);
                      setUpdateBalanceSavingId(null);
                      setNewBalanceModalValue("");
                    }}
                    disabled={!newBalanceModalValue.trim()}
                    className={cn(
                      "flex-[2] py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2",
                      !newBalanceModalValue.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-stone-800 hover:scale-[1.02] active:scale-95 shadow-lg shadow-stone-200"
                    )}
                  >
                    <Save className="w-4 h-4" /> Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddFinanceModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingRecord(null);
        }}
        addFinanceRecord={
          editingRecord ? updateFinanceRecord : addFinanceRecord
        }
        financeRecords={financeRecords}
        financeMappings={financeMappings}
        categoryToGroup={categoryToGroup}
        financeCategoryPrefs={financeCategoryPrefs}
        updateCategoryPref={updateCategoryPref}
        updateFinanceMapping={updateFinanceMapping}
        playSuccess={playSuccess}
        playClick={playClick}
        initialRecord={editingRecord}
      />

      {activeTab === "records" && (
        <button
          onClick={() => {
            setShowAddModal(true);
            playClick();
          }}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 ring-4 ring-white"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      {showPrintView && (
        <div className="fixed inset-0 z-[100] bg-white text-stone-900 overflow-y-auto p-6 md:p-12 print:p-0">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Controls Bar */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 print:hidden">
              <button 
                onClick={() => setShowPrintView(false)} 
                className="px-4 py-2 border border-stone-200 rounded-xl hover:bg-stone-50 font-bold transition-all text-xs flex items-center gap-1.5"
              >
                ← Kembali
              </button>
              <button 
                onClick={() => window.print()} 
                className="px-6 py-2 bg-stone-900 text-white rounded-xl hover:bg-stone-805 font-bold tracking-wider text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" /> Cetak Laporan (PDF)
              </button>
            </div>

            {/* Print Header */}
            <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200 pb-6 gap-4">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-widest text-stone-950">Laporan Histori Keuangan</h1>
                <p className="text-xs text-stone-400 mt-1 font-mono uppercase">Dicetak pada {new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}</p>
              </div>
              <div className="border border-stone-200 p-4 rounded-2xl bg-stone-50 text-right shrink-0">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-black">Total Transaksi</p>
                <p className="text-xl font-black text-stone-900 mt-0.5">{filteredRecords.length} Catatan</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 border border-stone-200 rounded-2xl bg-stone-50/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block leading-none">Total Arus Masuk</span>
                <span className="text-lg font-black mt-1 block text-stone-900">Rp {filteredRecords.filter(r => r.type === "income").reduce((acc, r) => acc + r.amount, 0).toLocaleString("id-ID")}</span>
              </div>
              <div className="p-5 border border-stone-200 rounded-2xl bg-stone-50/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block leading-none">Total Arus Keluar</span>
                <span className="text-lg font-black mt-1 block text-stone-900">Rp {filteredRecords.filter(r => r.type === "expense").reduce((acc, r) => acc + r.amount, 0).toLocaleString("id-ID")}</span>
              </div>
              <div className="p-5 border border-stone-900 bg-stone-900 rounded-2xl text-white shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 block leading-none">Selisih Bersih</span>
                <span className="text-lg font-black mt-1 block">
                  Rp {(
                    filteredRecords.filter(r => r.type === "income").reduce((acc, r) => acc + r.amount, 0) -
                    filteredRecords.filter(r => r.type === "expense").reduce((acc, r) => acc + r.amount, 0)
                  ).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Financial Details Table */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-3 font-bold uppercase text-stone-500 text-[9px] tracking-wider w-12 text-center">No</th>
                    <th className="p-3 font-bold uppercase text-stone-500 text-[9px] tracking-wider">Tanggal & Waktu</th>
                    <th className="p-3 font-bold uppercase text-stone-500 text-[9px] tracking-wider">Kategori</th>
                    <th className="p-3 font-bold uppercase text-stone-500 text-[9px] tracking-wider">Tipe</th>
                    <th className="p-3 font-bold uppercase text-stone-500 text-[9px] tracking-wider">Catatan / Keterangan</th>
                    <th className="p-3 font-bold uppercase text-stone-500 text-[9px] tracking-wider text-right">Jumlah (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-stone-400 font-medium">Tidak ada data transaksi ditemukan</td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, i) => (
                      <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3 text-center text-stone-400 font-mono font-bold">{i + 1}</td>
                        <td className="p-3 font-medium text-stone-600">{format(r.createdAt, "d MMM yyyy, HH:mm", { locale: id })}</td>
                        <td className="p-3 font-black text-stone-900">{r.category}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${r.type === 'income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {r.type === 'income' ? 'Masuk' : 'Keluar'}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500 italic font-medium">{r.note || '—'}</td>
                        <td className={`p-3 font-mono font-black text-right ${r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {r.type === 'income' ? '+' : '-'}Rp {r.amount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Elegant footer for print only */}
            <div className="hidden print:flex justify-between items-center text-[10px] text-stone-400 pt-8 border-t border-dashed border-stone-200 font-mono">
              <span>Dibuat secara aman melalui Catatan Keuangan Pribadi</span>
              <span>Verifikasi Otoritas Mandiri</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

