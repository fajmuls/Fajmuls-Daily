import React, { useState, useMemo, FormEvent, useEffect } from "react";
import { format, isSameDay, addMonths, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, X, Save, Calculator, Tag, Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "../lib/utils";
import { ICON_GROUPS } from "../data";
import { getCategoryColor, getCategoryIcon } from "../lib/financeUtils";

export function AddFinanceModal({
  isOpen = false,
  onClose = () => {},
  addFinanceRecord = () => {},
  financeRecords = [],
  categoryToGroup = {},
  financeMappings = {},
  financeCategoryPrefs = {},
  updateCategoryPref = () => {},
  updateFinanceMapping = () => {},
  playSuccess = () => {},
  playClick = () => {},
  initialRecord = null
}: any) {
  const [expression, setExpression] = useState(initialRecord ? initialRecord.amount.toString() : "");
  const [category, setCategory] = useState(initialRecord ? initialRecord.category : "");
  const [note, setNote] = useState(initialRecord ? (initialRecord.note || "") : "");
  const [type, setType] = useState<"income" | "expense">(initialRecord ? initialRecord.type : "expense");
  const [selectedIcon, setSelectedIcon] = useState(initialRecord && initialRecord.iconName ? initialRecord.iconName : "Tag");
  const [addRecordDate, setAddRecordDate] = useState<Date>(initialRecord ? new Date(initialRecord.createdAt) : new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [calendarView, setCalendarView] = useState(new Date());
  const [lastInitialRecord, setLastInitialRecord] = useState<any>(null);
  const [catSearch, setCatSearch] = useState("");
  const lastPlayTime = React.useRef(0);
  const playClickSurgically = () => {
    const now = Date.now();
    if (now - lastPlayTime.current > 120) {
      lastPlayTime.current = now;
      playClick();
    }
  };

  useEffect(() => {
    if (isOpen && initialRecord !== lastInitialRecord) {
      setExpression(initialRecord ? initialRecord.amount.toString() : "");
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

  const evaluatedValue = useMemo(() => {
    if (!expression) return 0;
    try {
      const cleaned = expression.replace(/[^\d+\-*/().]/g, "");
      if (!cleaned) return 0;
      // eslint-disable-next-line
      const result = new Function(`return ${cleaned}`)();
      if (typeof result === "number" && isFinite(result)) {
        return Math.max(0, result);
      }
    } catch (e) {
      // safe fallback
    }
    const cleanNum = expression.replace(/[^\d.]/g, "");
    return parseFloat(cleanNum) || 0;
  }, [expression]);

  const formatExpression = (expr: string) => {
    if (!expr) return "";
    return expr.replace(/(\d+(\.\d+)?)/g, (match) => {
      if (match.includes('.')) {
        const parts = match.split('.');
        const num = parseInt(parts[0], 10);
        return isNaN(num) ? match : `${num.toLocaleString("en-US")}.${parts[1]}`;
      } else {
        const num = parseInt(match, 10);
        return isNaN(num) ? match : num.toLocaleString("en-US");
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Read-only is enabled, but keep handler safe
    const inputVal = e.target.value;
    const rawExpr = inputVal.replace(/,/g, "");
    if (/^[0-9+\-*/().\s]*$/.test(rawExpr)) {
      setExpression(rawExpr);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!evaluatedValue || !category) return;

    const parentCategory = categoryToGroup[category] || "";

    addFinanceRecord({
      id: initialRecord ? initialRecord.id : uuidv4(),
      amount: evaluatedValue,
      category,
      parentCategory,
      note,
      type,
      createdAt: addRecordDate.getTime(),
      iconName: selectedIcon,
    });

    setExpression("");
    setCategory("");
    setNote("");
    setSelectedIcon("Tag");
    setShowAddModalWrapper(false);
    playSuccess();
  };
  
  const setShowAddModalWrapper = (val: boolean) => {
    if (!val) {
      onClose();
      setShowDatePicker(false);
      setShowCategoryPopup(false);
      setShowLogoEditor(false);
    }
  };

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
    return unmappedCategories.filter(c => (c as string).toLowerCase().includes(search));
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
            className="relative bg-paper w-full max-w-lg max-h-[95vh] rounded-[2.5rem] shadow-2xl border border-stone-200 flex flex-col disable-scrollbars overflow-hidden mt-auto sm:mt-0"
          >
             {/* Modal Header */}
             <div className="p-6 md:p-8 flex items-center justify-between border-b border-stone-100 bg-stone-50/50 shrink-0">
               <h3 className="font-serif text-2xl font-bold text-stone-900">
                 {initialRecord ? "Ubah Catatan" : "Tambah Catatan"}
               </h3>
               <button onClick={() => setShowAddModalWrapper(false)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm">
                 <X className="w-5 h-5 text-stone-500" />
               </button>
             </div>
             
             {/* Modal Form Content */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {/* Aligned compact Date and Transaction Type Layer */}
                                  <div className="flex flex-row items-center justify-between gap-2 p-1.5 bg-stone-50 border border-stone-200 rounded-2xl shadow-sm">
                   {/* Left: Compact Date trigger */}
                   <button 
                     type="button"
                     title="Klik untuk memilih tanggal"
                     onClick={() => { setShowDatePicker(!showDatePicker); playClickSurgically(); }}
                     className="flex items-center gap-2 cursor-pointer hover:bg-stone-200/50 p-2 rounded-xl transition-all select-none border border-stone-200/60 bg-white shadow-sm shrink-0 h-9"
                   >
                     <Calendar className="w-3.5 h-3.5 text-stone-600" />
                     <div className="flex flex-col text-left justify-start leading-none">
                       <span className="text-[7.5px] font-black uppercase text-stone-400 tracking-wider">Tanggal</span>
                       <span className="text-[11px] font-black text-stone-900 mt-0.5 whitespace-nowrap">
                         {format(addRecordDate, 'd MMM yyyy', { locale: id })}
                       </span>
                     </div>
                   </button>

                   {/* Right: Sleek mini type selectors */}
                   <div className="flex items-center gap-1 p-0.5 bg-stone-200/65 rounded-xl border border-stone-200/80 shrink-0 h-9">
                     <button
                       type="button"
                       onClick={() => { 
                         setType("expense"); 
                         if (type !== "expense") setCategory(""); 
                         playClickSurgically(); 
                       }}
                       className={cn(
                         "px-2.5 rounded-lg flex items-center gap-1 transition-all text-[9.5px] font-black uppercase tracking-wider h-8",
                         type === "expense" 
                           ? "bg-rose-600 text-white shadow-sm border border-rose-700 font-black h-8" 
                           : "text-stone-500 hover:text-stone-800 font-bold h-8"
                       )}
                     >
                       <span className={cn(
                         "w-3 h-3 rounded-full flex items-center justify-center font-bold text-[9px]",
                         type === "expense" ? "bg-white text-rose-600" : "bg-stone-300 text-stone-600"
                       )}>-</span>
                       <span>Keluar</span>
                     </button>
                     
                     <button
                       type="button"
                       onClick={() => { 
                         setType("income"); 
                         if (type !== "income") setCategory(""); 
                         playClickSurgically(); 
                       }}
                       className={cn(
                         "px-2.5 rounded-lg flex items-center gap-1 transition-all text-[9.5px] font-black uppercase tracking-wider h-8",
                         type === "income" 
                           ? "bg-emerald-600 text-white shadow-sm border border-emerald-700 font-black h-8" 
                           : "text-stone-500 hover:text-stone-800 font-bold h-8"
                       )}
                     >
                       <span className={cn(
                         "w-3 h-3 rounded-full flex items-center justify-center font-bold text-[9px]",
                         type === "income" ? "bg-white text-emerald-600" : "bg-stone-300 text-stone-600"
                       )}>+</span>
                       <span>Masuk</span>
                     </button>
                   </div>
                 </div>


                 {/* Inline Date Picker Drawer */}
                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      className="overflow-hidden border border-stone-200 rounded-2xl bg-white p-4 shadow-inner"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={() => setCalendarView(subMonths(calendarView, 1))} className="p-2 hover:bg-stone-50 rounded-xl"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="font-bold text-xs uppercase tracking-widest text-stone-900">{format(calendarView, 'MMMM yyyy', { locale: id })}</span>
                        <button type="button" onClick={() => setCalendarView(addMonths(calendarView, 1))} className="p-2 hover:bg-stone-50 rounded-xl"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <span key={d} className="text-[9px] font-black uppercase tracking-widest text-stone-400 py-1">{d}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: new Date(calendarView.getFullYear(), calendarView.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                        {daysInMonth.map((date, i) => {
                          const selected = isSameDay(date, addRecordDate);
                          return (
                            <button 
                              key={i} 
                              type="button"
                              onClick={() => { setAddRecordDate(date); setShowDatePicker(false); playClick(); }}
                              className={cn("h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all", selected ? "bg-stone-900 text-white shadow-md" : "hover:bg-stone-100 text-stone-700")}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. Category Dropdown Trigger (Positioned above Amount/Quantity) */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1.5">Kategori</label>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowCategoryPopup(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowCategoryPopup(true);
                      }
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 flex items-center justify-between hover:bg-stone-100 hover:border-stone-400 cursor-pointer transition-colors shadow-sm select-none"
                  >
                    <div className="flex items-center gap-3">
                      {category ? (
                        <>
                          {/* Logo icon div: clicking edits the logo */}
                          <button
                            type="button"
                            title="Edit logo kategori Anda"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setShowLogoEditor(true); 
                              playClickSurgically();
                            }}
                            className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-700 shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all outline-none bg-white font-bold"
                            style={{ backgroundColor: financeCategoryPrefs[category]?.color || "#ffffff" }}
                          >
                            {(() => {
                              const prefIcon = financeCategoryPrefs[category]?.iconName || getCategoryIcon(category, type, financeCategoryPrefs);
                              const Icon = (LucideIcons as any)[prefIcon] || Tag;
                              const prefColor = financeCategoryPrefs[category]?.color;
                              return (
                                <Icon 
                                  className="w-5 h-5 transition-transform group-hover:scale-110" 
                                  style={{ color: prefColor ? "#ffffff" : getCategoryColor(category, type, financeCategoryPrefs) }} 
                                />
                              );
                            })()}
                          </button>
                          <div className="flex flex-col items-start leading-tight">
                            <span className="font-bold text-sm text-stone-900">{category}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-stone-400">
                              Grup: {categoryToGroup[category] || "Tanpa Grup"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-500">
                            <Tag className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm text-stone-400">Pilih Kategori Transaksi</span>
                        </>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </div>
                </div>

                {/* 4. Amount/Quantity Input combined with Inline Calculator */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1.5">Jumlah / Quantity</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-black text-sm select-none">Rp</span>
                      <input
                        type="text"
                        readOnly
                        value={formatExpression(expression)}
                        required
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-4 py-4 outline-none font-sans text-2xl font-extrabold tracking-wider transition-all text-stone-950 shadow-inner select-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Integrated Calculator Keypad */}
                  <div className="p-4 bg-stone-950 border border-stone-800 rounded-3xl shadow-lg w-full font-sans">
                    <div className="flex justify-between items-center mb-3 border-b border-stone-800 pb-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5 select-none font-sans">
                        <Calculator className="w-3.5 h-3.5" /> Kalkulator Terintegrasi
                      </span>
                      {expression && (
                        <span className="text-[11px] font-extrabold text-yellow-400 font-sans tracking-wide">
                          Hasil: Rp {(evaluatedValue || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        ['7', '8', '9', '/'],
                        ['4', '5', '6', '*'],
                        ['1', '2', '3', '-'],
                        ['C', '0', '⌫', '+']
                      ].map((row, rIdx) => (
                        <React.Fragment key={rIdx}>
                          {row.map((btn) => (
                            <button
                              type="button"
                              key={btn}
                              onClick={() => {
                                playClickSurgically();
                                if (btn === 'C') {
                                  setExpression('');
                                } else if (btn === '⌫') {
                                  setExpression(prev => prev.slice(0, -1));
                                } else {
                                  setExpression(prev => {
                                    if (prev === '0' && !isNaN(Number(btn))) return btn;
                                    return prev + btn;
                                  });
                                }
                              }}
                              className={cn(
                                "py-3 rounded-xl font-black text-base transition-all active:scale-[0.93] flex items-center justify-center border",
                                ['/', '*', '-', '+'].includes(btn)
                                  ? "bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700 hover:border-stone-500"
                                  : btn === 'C'
                                  ? "bg-red-950 text-red-300 border-red-800/50 hover:bg-red-900"
                                  : btn === '⌫'
                                  ? "bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700"
                                  : "bg-stone-900 text-white border-stone-800 hover:bg-stone-850 hover:border-stone-700"
                              )}
                            >
                              {btn}
                            </button>
                          ))}
                        </React.Fragment>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          playClickSurgically();
                          try {
                            const val = new Function(`return ${expression.replace(/[^\d+\-*/()]/g, "")}`)();
                            if (Number.isFinite(val)) {
                              setExpression(val.toString());
                              playSuccess();
                            }
                          } catch (e) {}
                        }}
                        disabled={!expression}
                        className={cn(
                          "col-span-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all mt-1 flex items-center justify-center gap-2",
                          expression 
                            ? "bg-white text-stone-900 hover:bg-stone-100 active:scale-[0.97] shadow-md cursor-pointer"
                            : "bg-stone-900 text-stone-700 border border-stone-850 cursor-not-allowed"
                        )}
                      >
                        Selesaikan Kalkulasi (=)
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Notes Detail Field */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1.5">Catatan Detail (Opsional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 outline-none focus:border-stone-400 font-semibold text-sm text-stone-900 shadow-sm"
                    placeholder="Contoh: Belanja Bulanan di Supermarket..."
                  />
                </div>
             </div>

             {/* Modal Action Footer */}
             <div className="p-6 md:p-8 border-t border-stone-100 bg-white shrink-0 relative z-20">
               <button
                 type="button"
                 onClick={handleSubmit}
                 disabled={!evaluatedValue || !category}
                 className={cn(
                   "w-full rounded-2xl py-4.5 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl", 
                   (!evaluatedValue || !category) 
                     ? "bg-stone-200 text-stone-400 cursor-not-allowed" 
                     : "bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] shadow-stone-300"
                 )}
               >
                 <Save className="w-4 h-4" /> Simpan Transaksi
               </button>
             </div>

             {/* Dynamic Sub-Popup: Category Selector with Search and Auto Group Routing */}
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
                       <button type="button" onClick={() => { setShowCategoryPopup(false); setCatSearch(""); playClick(); }} className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-stone-200 transition-all">
                         <ChevronLeft className="w-5 h-5 text-stone-600" />
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
                     
                     {/* Creating a Completely New Category Option */}
                     {catSearch && !Object.values(financeMappings).flat().includes(catSearch) && !unmappedCategories.includes(catSearch) && (
                        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4 shadow-xl">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                  <Plus className="w-5 h-5 text-white" />
                               </div>
                               <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Buat Kategori Baru</p>
                                  <p className="font-bold text-white">"{catSearch}"</p>
                               </div>
                            </div>
                            
                            <div className="border-t border-stone-800 pt-3 space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block mb-1">
                                Pilih Grup Mappings Kategori:
                              </label>
                              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                                {Object.keys(financeMappings).map((groupName) => (
                                  <button
                                    key={groupName}
                                    type="button"
                                    onClick={() => {
                                      updateCategoryPref(catSearch, {
                                        iconName: type === 'income' ? 'TrendingUp' : 'Tag',
                                        color: type === 'income' ? '#00897B' : '#E53935'
                                      });
                                      
                                      const curMapping = financeMappings[groupName] || [];
                                      updateFinanceMapping(groupName, [...curMapping, catSearch]);
                                      
                                      setCategory(catSearch);
                                      setSelectedIcon(type === 'income' ? 'TrendingUp' : 'Tag');
                                      setShowCategoryPopup(false);
                                      setCatSearch("");
                                      playSuccess();
                                    }}
                                    className="px-3 py-1.5 bg-stone-850 hover:bg-stone-700 text-stone-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                  >
                                    {groupName}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newGroup = prompt("Input nama grup baru Anda:");
                                    if (newGroup && newGroup.trim()) {
                                      const groupTrim = newGroup.trim();
                                      if (financeMappings[groupTrim]) {
                                        alert("Grup sudah terdaftar!");
                                        return;
                                      }
                                      
                                      updateCategoryPref(catSearch, {
                                        iconName: type === 'income' ? 'TrendingUp' : 'Tag',
                                        color: type === 'income' ? '#00897B' : '#E53935'
                                      });
                                      
                                      updateFinanceMapping(groupTrim, [catSearch]);
                                      
                                      setCategory(catSearch);
                                      setSelectedIcon(type === 'income' ? 'TrendingUp' : 'Tag');
                                      setShowCategoryPopup(false);
                                      setCatSearch("");
                                      playSuccess();
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-stone-850 text-yellow-400 hover:text-white hover:bg-stone-700 border border-dashed border-stone-700 rounded-xl text-[10px] font-black uppercase tracking-wider"
                                >
                                  + Grup Baru
                                </button>
                              </div>
                            </div>
                        </div>
                     )}

                     {Object.keys(financeMappings).length === 0 && unmappedCategories.length === 0 && !catSearch ? (
                       <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                             <Tag className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="font-bold text-stone-900">Belum ada Kategori</p>
                             <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-black leading-normal">
                                Tambahkan Kategori atau Grup di tab Settings &gt; KUSTOMISASI KATEGORI
                             </p>
                          </div>
                       </div>
                     ) : (
                       <>
                         {Object.entries(filteredMappings).map(([groupName, categories]) => {
                           const catArray = Array.isArray(categories) ? categories : [];
                           if (catArray.length === 0) return null;
                           return (
                             <div key={groupName} className="space-y-3">
                               <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold border-b border-stone-100 pb-1">{groupName}</label>
                               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                  {catArray.map((cat, i) => {
                                     const iconName = getCategoryIcon(cat as string, type, financeCategoryPrefs);
                                     const IconComp = iconName ? (LucideIcons as any)[iconName] : Tag;
                                     const isSelected = category === cat;

                                     return (
                                         <button 
                                           key={i} 
                                           type="button" 
                                           onClick={() => { 
                                             setCategory(cat); 
                                             setSelectedIcon(iconName || "Tag"); 
                                             setShowCategoryPopup(false); 
                                             setCatSearch(""); 
                                             playClick(); 
                                           }}
                                           className={cn(
                                             "aspect-square p-2 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer",
                                             isSelected ? "bg-stone-900 border-stone-900 text-white shadow-lg scale-105" : "bg-white border-stone-200 hover:border-stone-400 text-stone-700"
                                           )}
                                         >
                                            <IconComp className="w-6 h-6" style={{ color: isSelected ? 'white' : getCategoryColor(cat as string, type, financeCategoryPrefs) }} />
                                            <span className={cn("text-[9px] font-extrabold uppercase tracking-wider truncate w-full text-center mt-1 px-1", isSelected ? "text-stone-200" : "text-stone-500")}>
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
                           <div className="space-y-3">
                             <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold border-b border-stone-100 pb-1">Tanpa Grup</label>
                             <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {filteredUnmapped.map((catAny, i) => {
                                   const cat = catAny as string;
                                   const iconName = getCategoryIcon(cat, type, financeCategoryPrefs);
                                   const IconComp = iconName ? (LucideIcons as any)[iconName] : Tag;
                                   const isSelected = category === cat;

                                   return (
                                       <button 
                                         key={`unmapped-${i}`} 
                                         type="button" 
                                         onClick={() => { 
                                           setCategory(cat); 
                                           setSelectedIcon(iconName || "Tag"); 
                                           setShowCategoryPopup(false); 
                                           setCatSearch(""); 
                                           playClick(); 
                                         }}
                                         className={cn(
                                           "aspect-square p-2 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer",
                                           isSelected ? "bg-stone-900 border-stone-900 text-white shadow-lg scale-105" : "bg-white border-stone-200 hover:border-stone-400 text-stone-700"
                                         )}
                                       >
                                          <IconComp className="w-6 h-6" style={{ color: isSelected ? 'white' : getCategoryColor(cat as string, type, financeCategoryPrefs) }} />
                                          <span className={cn("text-[9px] font-extrabold uppercase tracking-wider truncate w-full text-center mt-1 px-1", isSelected ? "text-stone-200" : "text-stone-500")}>
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

             {/* Dynamic Sub-Popup: In-place Category Logo and Accent Customizer */}
             <AnimatePresence>
               {showLogoEditor && category && (
                 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setShowLogoEditor(false)}
                     className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm"
                   />
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="relative bg-paper w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-stone-200 p-6 flex flex-col max-h-[85vh] z-50 overflow-hidden"
                   >
                     {/* Editor Header */}
                     <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3 shrink-0">
                       <div>
                         <h4 className="font-serif text-lg font-bold text-stone-950">Kustomisasi Logo</h4>
                         <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Kategori: {category}</span>
                       </div>
                       <button type="button" onClick={() => setShowLogoEditor(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                         <X className="w-5 h-5 text-stone-500" />
                       </button>
                     </div>

                     {/* Editor Scrollable Options */}
                     <div className="overflow-y-auto custom-scrollbar flex-1 space-y-6 pr-1 pb-4">
                       {/* Color Picker Section */}
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block">Accent Color</label>
                         <div className="grid grid-cols-5 gap-2.5">
                           {[
                             "#FF4500", "#D81B60", "#8E24AA", "#1E88E5", "#00897B",
                             "#43A047", "#E53935", "#3949AB", "#FFC107", "#FF5722",
                             "#795548", "#1c1917", "#607D8B", "#E91E63", "#9C27B0"
                           ].map((c) => {
                             const curPref = financeCategoryPrefs[category]?.color || getCategoryColor(category, type, financeCategoryPrefs);
                             const isSelected = curPref === c;
                             return (
                               <button
                                 key={c}
                                 type="button"
                                 onClick={() => {
                                   const curIcon = financeCategoryPrefs[category]?.iconName || getCategoryIcon(category, type, financeCategoryPrefs);
                                   updateCategoryPref(category, { color: c, iconName: curIcon });
                                   playClick();
                                 }}
                                 className={cn(
                                   "aspect-square rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 cursor-pointer",
                                   isSelected ? "ring-2 ring-stone-900 scale-110" : ""
                                 )}
                                 style={{ backgroundColor: c }}
                               />
                             );
                           })}
                         </div>
                         
                         {/* Native custom color selection */}
                         <div className="flex items-center gap-2 pt-1.5">
                           <span className="text-[9px] font-black uppercase tracking-wide text-stone-400">Custom Warna:</span>
                           <input
                             type="color"
                             value={financeCategoryPrefs[category]?.color || getCategoryColor(category, type, financeCategoryPrefs)}
                             onChange={(e) => {
                               const curIcon = financeCategoryPrefs[category]?.iconName || getCategoryIcon(category, type, financeCategoryPrefs);
                               updateCategoryPref(category, { color: e.target.value, iconName: curIcon });
                             }}
                             className="w-8 h-6 cursor-pointer border-0 p-0 rounded-lg overflow-hidden bg-transparent shrink-0"
                           />
                         </div>
                       </div>

                       {/* Icon Picker Section */}
                       <div className="space-y-4">
                         <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 block">Pilih Ikon</label>
                         {ICON_GROUPS.map((gro) => (
                           <div key={gro.name} className="space-y-2">
                             <span className="text-[8px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-0.5 block">{gro.name}</span>
                             <div className="grid grid-cols-6 gap-2">
                               {gro.icons.map((icoName) => {
                                 const IcoComp = (LucideIcons as any)[icoName];
                                 const curIcon = financeCategoryPrefs[category]?.iconName || getCategoryIcon(category, type, financeCategoryPrefs);
                                 const isSelected = curIcon === icoName;
                                 return (
                                   <button
                                     key={icoName}
                                     type="button"
                                     onClick={() => {
                                       const curColor = financeCategoryPrefs[category]?.color || getCategoryColor(category, type, financeCategoryPrefs);
                                       updateCategoryPref(category, { iconName: icoName, color: curColor });
                                       setSelectedIcon(icoName);
                                       playClick();
                                     }}
                                     className={cn(
                                       "aspect-square rounded-xl flex items-center justify-center text-stone-600 transition-all cursor-pointer hover:bg-stone-200",
                                       isSelected ? "bg-stone-900 text-white shadow-md scale-105" : "bg-stone-50"
                                     )}
                                   >
                                     {IcoComp && <IcoComp className="w-4 h-4" />}
                                   </button>
                                 );
                               })}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>

                     {/* Editor Close Action */}
                     <button
                       type="button"
                       onClick={() => setShowLogoEditor(false)}
                       className="w-full bg-stone-900 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-stone-800 transition-colors shrink-0 mt-3"
                     >
                       Selesai Kustomisasi
                     </button>
                   </motion.div>
                 </div>
               )}
             </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
