import React, { useState, useMemo, FormEvent } from "react";
import { format, isSameDay, addMonths, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, X, Save, Calculator, Tag, Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "../lib/utils";
import { ICON_GROUPS } from "../data";

export function AddFinanceModal({
  isOpen,
  onClose,
  addFinanceRecord,
  financeRecords,
  categoryToGroup,
  financeMappings,
  financeCategoryPrefs,
  playSuccess,
  playClick,
  initialRecord = null
}: any) {
  const [amount, setAmount] = useState(initialRecord ? initialRecord.amount.toString() : "");
  const [category, setCategory] = useState(initialRecord ? initialRecord.category : "");
  const [note, setNote] = useState(initialRecord ? (initialRecord.note || "") : "");
  const [type, setType] = useState<"income" | "expense">(initialRecord ? initialRecord.type : "expense");
  const [selectedIcon, setSelectedIcon] = useState(initialRecord && initialRecord.iconName ? initialRecord.iconName : "Tag");
  const [addRecordDate, setAddRecordDate] = useState<Date>(initialRecord ? new Date(initialRecord.createdAt) : new Date());
  
  const [showCalc, setShowCalc] = useState(false);
  const [calcValue, setCalcValue] = useState("0");
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [calendarView, setCalendarView] = useState(new Date());
  const [lastInitialRecord, setLastInitialRecord] = useState<any>(null);
  const [catSearch, setCatSearch] = useState("");

  React.useEffect(() => {
    if (isOpen && initialRecord !== lastInitialRecord) {
      setAmount(initialRecord ? initialRecord.amount.toString() : "");
      setCategory(initialRecord ? initialRecord.category : "");
      setNote(initialRecord ? (initialRecord.note || "") : "");
      setType(initialRecord ? initialRecord.type : "expense");
      setSelectedIcon(initialRecord && initialRecord.iconName ? initialRecord.iconName : "Tag");
      setAddRecordDate(initialRecord ? new Date(initialRecord.createdAt) : new Date());
      setLastInitialRecord(initialRecord);
    }
  }, [isOpen, initialRecord, lastInitialRecord]);

  const daysInMonth = Array.from(
    { length: new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 0).getDate() },
    (_, i) => new Date(calendarView.getFullYear(), calendarView.getMonth(), i + 1)
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    const parentCategory = categoryToGroup[category] || "";
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return;

    addFinanceRecord({
      id: initialRecord ? initialRecord.id : uuidv4(),
      amount: parsedAmount,
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
    setShowAddModalWrapper(false);
    playSuccess();
  };
  
  const setShowAddModalWrapper = (val: boolean) => {
    if (!val) onClose();
  };

  const getCategoryColor = (catName: string) => {
    if (financeCategoryPrefs[catName]?.color) return financeCategoryPrefs[catName].color;
    
    // Distinct, vibrant, legible colors for brutalist theme
    const COLORS_EXPENSE = ["#FF4500", "#D81B60", "#8E24AA", "#1E88E5", "#00897B", "#43A047", "#E53935", "#3949AB"];
    const COLORS_INCOME = ["#00C853", "#2962FF", "#FFAB00", "#C51162", "#00BFA5", "#FF6D00", "#6200EA", "#AEEA00"];
    
    const colors = type === "income" ? COLORS_INCOME : COLORS_EXPENSE;
    let hash = 0;
    for (let i = 0; i < catName.length; i++) {
      hash = catName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  const getCategoryIcon = (catName: string) => {
    if (financeCategoryPrefs[catName]?.iconName) return financeCategoryPrefs[catName].iconName;
    const existingRecord = financeRecords.find((r: any) => r.category === catName && r.iconName);
    if (existingRecord) return existingRecord.iconName;
    return type === "income" ? "TrendingUp" : "TrendingDown";
  };

  const categorySuggestions = useMemo(() => {
    // Only use categories strictly defined in the "Group and Category" settings
    const definedCats = Object.keys(categoryToGroup);
    
    // Sort them alphabetically
    return definedCats.sort((a, b) => a.localeCompare(b));
  }, [categoryToGroup]);

  const unmappedCategories = useMemo(() => {
    const definedCats = new Set(Object.values(financeMappings).flat() as string[]);
    const usedCats = new Set(financeRecords.map((r: any) => r.category));
    return Array.from(usedCats).filter((cat: any) => !definedCats.has(cat)).sort();
  }, [financeMappings, financeRecords]);

  const filteredMappings = useMemo(() => {
    const search = catSearch.toLowerCase();
    if (!search) return financeMappings;
    
    const result: Record<string, string[]> = {};
    Object.entries(financeMappings).forEach(([group, cats]) => {
      const filtered = (cats as string[]).filter(c => c.toLowerCase().includes(search));
      if (filtered.length > 0) result[group] = filtered;
    });
    return result;
  }, [financeMappings, catSearch]);

  const filteredUnmapped = useMemo(() => {
    const search = catSearch.toLowerCase();
    return unmappedCategories.filter(c => c.toLowerCase().includes(search));
  }, [unmappedCategories, catSearch]);


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModalWrapper(false)}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-paper w-full max-w-lg max-h-[90vh] md:max-h-[85vh] rounded-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-stone-200 flex flex-col disable-scrollbars overflow-hidden mt-auto sm:mt-0"
          >
             <div className="p-6 md:p-8 flex items-center justify-between border-b border-stone-100 bg-stone-50/50 shrink-0">
               <h3 className="font-serif text-2xl font-bold text-stone-900">Tambah Catatan</h3>
               <button onClick={() => setShowAddModalWrapper(false)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm">
                 <X className="w-6 h-6 text-stone-500" />
               </button>
             </div>
             
             <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => { 
                      setType("expense"); 
                      if (type !== "expense") setCategory(""); 
                      playClick(); 
                    }}
                    className={cn("flex-1 py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all", type === "expense" ? "bg-white border border-stone-100 text-stone-900 shadow-sm" : "text-stone-500")}
                  >
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1"><Minus className="w-4 h-4" /></span>
                    <span className="font-black text-[10px] uppercase tracking-widest text-center">Pengeluaran</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { 
                      setType("income"); 
                      if (type !== "income") setCategory(""); 
                      playClick(); 
                    }}
                    className={cn("flex-1 py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all", type === "income" ? "bg-white border border-stone-100 text-stone-900 shadow-sm" : "text-stone-500")}
                  >
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-1"><Plus className="w-4 h-4" /></span>
                    <span className="font-black text-[10px] uppercase tracking-widest text-center">Pemasukan</span>
                  </button>
                </div>

                <div className="space-y-5">
                   <div className="bg-stone-50/50 p-4 rounded-3xl border border-stone-100 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-stone-50" onClick={() => setShowDatePicker(true)}>
                       <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Tanggal Transaksi</span>
                       <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-stone-900" />
                          <span className="text-lg font-bold tracking-tight text-stone-900">{format(addRecordDate, 'EEEE, d MMMM yyyy', { locale: id })}</span>
                       </div>
                   </div>
                   
                   <AnimatePresence>
                     {showDatePicker && (
                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="bg-white border border-stone-200 rounded-3xl p-4 shadow-sm">
                             <div className="flex items-center justify-between mb-4">
                               <button onClick={() => setCalendarView(subMonths(calendarView, 1))} className="p-2 hover:bg-stone-50 rounded-xl"><ChevronLeft className="w-4 h-4" /></button>
                               <span className="font-bold text-sm uppercase tracking-widest text-stone-900">{format(calendarView, 'MMMM yyyy', { locale: id })}</span>
                               <button onClick={() => setCalendarView(addMonths(calendarView, 1))} className="p-2 hover:bg-stone-50 rounded-xl"><ChevronRight className="w-4 h-4" /></button>
                             </div>
                             <div className="grid grid-cols-7 gap-1 text-center mb-2">
                               {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <span key={d} className="text-[10px] font-black uppercase tracking-widest text-stone-400 py-1">{d}</span>)}
                             </div>
                             <div className="grid grid-cols-7 gap-1">
                               {Array.from({ length: new Date(calendarView.getFullYear(), calendarView.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                               {daysInMonth.map((date, i) => {
                                 const selected = isSameDay(date, addRecordDate);
                                 return (
                                   <button 
                                     key={i} 
                                     onClick={() => { setAddRecordDate(date); setShowDatePicker(false); playClick(); }}
                                     className={cn("h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all", selected ? "bg-stone-900 text-white shadow-md" : "hover:bg-stone-100 text-stone-700")}
                                   >
                                     {date.getDate()}
                                   </button>
                                 );
                               })}
                             </div>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>

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
                        className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-12 py-4 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-900/5 font-mono text-xl font-bold transition-all"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => { setCalcValue(amount || "0"); setShowCalc(!showCalc); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all text-stone-700"
                      >
                        <Calculator className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {showCalc && (
                      <div className="mt-2 p-4 bg-stone-900 border border-stone-800 rounded-3xl shadow-xl w-full">
                         <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Kalkulator Mini</span>
                           <button onClick={() => setShowCalc(false)} className="text-stone-400 hover:text-white"><X className="w-4 h-4"/></button>
                         </div>
                         <input 
                           type="text" 
                           value={calcValue}
                           readOnly
                           className="w-full bg-stone-800 rounded-xl p-3 text-right text-white font-mono text-xl font-bold mb-4 focus:outline-none border border-stone-700"
                         />
                         <div className="grid grid-cols-4 gap-2">
                           {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','.','+'].map(btn => (
                             <button
                               type="button"
                               key={btn}
                               onClick={() => {
                                 if (btn === 'C') setCalcValue('0');
                                 else setCalcValue(prev => prev === '0' ? btn : prev + btn);
                               }}
                               className="p-3 bg-stone-800 text-white hover:bg-stone-700 rounded-xl font-bold text-lg transition-colors border border-stone-700 hover:border-stone-500 shadow-sm"
                             >
                               {btn}
                             </button>
                           ))}
                           <button
                             type="button"
                             onClick={() => {
                               try {
                                 // eslint-disable-next-line
                                 const val = new Function('return ' + calcValue)();
                                 if (Number.isFinite(val)) {
                                   setAmount(val.toString());
                                   setShowCalc(false);
                                 }
                               } catch (e) {}
                             }}
                             className="col-span-4 p-3 bg-white text-stone-900 rounded-xl font-bold transition-transform active:scale-[0.98] shadow-md mt-1"
                           >
                             Terapkan Nominal
                           </button>
                         </div>
                      </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Kategori</label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryPopup(true)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between hover:bg-stone-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {category ? (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 shadow-sm">
                              {(() => {
                                const Icon = (LucideIcons as any)[selectedIcon] || Tag;
                                return <Icon className="w-5 h-5" />;
                              })()}
                            </div>
                            <span className="font-bold text-sm text-stone-900">{category}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-500">
                              <Tag className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm text-stone-400">Pilih Kategori Transaksi</span>
                          </>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-400" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-2">Catatan Detail (Opsional)</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-4 outline-none focus:border-stone-400 font-medium text-sm"
                      placeholder="Detail biaya..."
                    />
                  </div>
                </div>
             </div>

             <div className="p-6 md:p-8 border-t border-stone-100 bg-white shrink-0 relative z-20">
               <button
                 type="button"
                 onClick={handleSubmit}
                 disabled={!amount || !category}
                 className={cn("w-full rounded-2xl py-5 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl", (!amount || !category) ? "bg-stone-200 text-stone-400 cursor-not-allowed" : "bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] shadow-stone-300")}
               >
                 <Save className="w-5 h-5" /> Simpan Transaksi
               </button>
             </div>

             <AnimatePresence>
               {showCategoryPopup && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   exit={{ opacity: 0, x: 20 }} 
                   className="absolute inset-0 z-30 bg-paper flex flex-col"
                 >
                   <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
                     <div className="flex items-center gap-4 w-full">
                       <button onClick={() => { setShowCategoryPopup(false); setCatSearch(""); }} className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-stone-200 transition-all">
                         <ChevronLeft className="w-6 h-6 text-stone-600" />
                       </button>
                       <div className="flex-1 relative">
                         <input 
                           type="text"
                           placeholder="Cari atau pilih kategori..."
                           value={catSearch}
                           onChange={(e) => setCatSearch(e.target.value)}
                           className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-stone-900/5 font-bold"
                         />
                         <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                       </div>
                     </div>
                   </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                     {catSearch && !Object.values(financeMappings).flat().includes(catSearch) && !unmappedCategories.includes(catSearch) && (
                        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 flex items-center justify-between shadow-brutal-sm">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                 <Plus className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Kategori Baru</p>
                                 <p className="font-bold text-white">"{catSearch}"</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => {
                               setCategory(catSearch);
                               setSelectedIcon(type === 'income' ? 'TrendingUp' : 'Tag');
                               setShowCategoryPopup(false);
                               setCatSearch("");
                               playClick();
                             }}
                             className="px-6 py-3 bg-white text-stone-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-100 transition-all active:scale-95"
                           >
                             Gunakan
                           </button>
                        </div>
                     )}

                     {Object.keys(financeMappings).length === 0 && unmappedCategories.length === 0 && !catSearch ? (
                       <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                             <Tag className="w-8 h-8" />
                          </div>
                          <div>
                             <p className="font-bold text-stone-900">Belum ada kategori</p>
                             <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-black">Tambah kategori di menu Keuangan &gt; Kategori &amp; Grup</p>
                          </div>
                       </div>
                     ) : (
                       <>
                         {Object.entries(filteredMappings).map(([groupName, categories]) => {
                           const catArray = Array.isArray(categories) ? categories : [];
                           if (catArray.length === 0) return null;
                           return (
                             <div key={groupName}>
                               <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-4">{groupName}</label>
                               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                  {catArray.map((cat, i) => {
                                     const iconName = getCategoryIcon(cat);
                                     const IconComp = iconName ? (LucideIcons as any)[iconName] : Tag;
                                     const isSelected = category === cat;

                                     return (
                                         <button 
                                           key={i} 
                                           type="button" 
                                           onClick={() => { setCategory(cat); setSelectedIcon(iconName || "Tag"); setShowCategoryPopup(false); setCatSearch(""); playClick(); }}
                                           className={cn(
                                             "aspect-square p-2 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm",
                                             isSelected ? "bg-stone-900 border-stone-900 text-white shadow-lg" : "bg-white border-stone-200 hover:border-stone-400 text-stone-700"
                                           )}
                                         >
                                            <IconComp className={cn("w-6 h-6")} style={{ color: isSelected ? 'white' : getCategoryColor(cat) }} />
                                            <span className={cn("text-[9px] font-bold uppercase tracking-wider truncate w-full text-center mt-1", isSelected ? "text-stone-200" : "text-stone-500")}>
                                              {cat}
                                            </span>
                                         </button>
                                     );
                                  })}
                               </div>
                             </div>
                           );
                         })}

                         {filteredUnmapped.length > 0 && (
                           <div>
                             <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-4">Tanpa Grup</label>
                             <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {filteredUnmapped.map((cat, i) => {
                                   const iconName = getCategoryIcon(cat);
                                   const IconComp = iconName ? (LucideIcons as any)[iconName] : Tag;
                                   const isSelected = category === cat;

                                   return (
                                       <button 
                                         key={`unmapped-${i}`} 
                                         type="button" 
                                         onClick={() => { setCategory(cat); setSelectedIcon(iconName || "Tag"); setShowCategoryPopup(false); setCatSearch(""); playClick(); }}
                                         className={cn(
                                           "aspect-square p-2 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm",
                                           isSelected ? "bg-stone-900 border-stone-900 text-white shadow-lg" : "bg-white border-stone-200 hover:border-stone-400 text-stone-700"
                                         )}
                                       >
                                          <IconComp className={cn("w-6 h-6")} style={{ color: isSelected ? 'white' : getCategoryColor(cat) }} />
                                          <span className={cn("text-[9px] font-bold uppercase tracking-wider truncate w-full text-center mt-1", isSelected ? "text-stone-200" : "text-stone-500")}>
                                            {cat}
                                          </span>
                                       </button>
                                   );
                                })}
                             </div>
                           </div>
                         )}
                       </>
                     )}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
