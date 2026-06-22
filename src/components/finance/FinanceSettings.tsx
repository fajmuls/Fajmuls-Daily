import React, { useState } from 'react';
import { Folder, Tag, Plus, Trash2, Edit3, Settings, ChevronRight, Save, X, Palette } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "../../lib/utils";
import { ActionMenu } from "../ActionMenu";
import { ICON_GROUPS, COLORS } from "../../data";
import { motion, AnimatePresence } from 'motion/react';

interface FinanceSettingsProps {
  financeMappings: Record<string, string[]>;
  allCategories: string[];
  unmappedCategories: string[];
  categoryToGroup: Record<string, string>;
  managedGroup: string | null;
  setManagedGroup: (val: string | null) => void;
  updateFinanceMapping: (group: string, cats: string[]) => void;
  deleteFinanceMapping: (group: string) => void;
  showConfirm: (msg: string, onConfirm: () => void) => void;
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
  categoryEdits: any;
  setCategoryEdits: (val: any) => void;
  pickingIconFor: string | null;
  setPickingIconFor: (val: string | null) => void;
  pickingColorFor: string | null;
  setPickingColorFor: (val: string | null) => void;
  movingCategoryGroup: string | null;
  setMovingCategoryGroup: (val: string | null) => void;
  financeCategoryPrefs: any;
  updateCategoryPref: (cat: string, pref: any) => void;
  deleteFinanceCategoryBulk: (cat: string) => void;
  getCatEdit: (cat: string) => any;
  renderCategoryItemUI: (cat: string, editObj: any) => React.ReactNode;
}

export function FinanceSettings({
  financeMappings,
  allCategories,
  unmappedCategories,
  categoryToGroup,
  managedGroup,
  setManagedGroup,
  updateFinanceMapping,
  deleteFinanceMapping,
  showConfirm,
  playClick,
  playSuccess,
  playError,
  categoryEdits,
  setCategoryEdits,
  pickingIconFor,
  setPickingIconFor,
  pickingColorFor,
  setPickingColorFor,
  movingCategoryGroup,
  setMovingCategoryGroup,
  financeCategoryPrefs,
  updateCategoryPref,
  deleteFinanceCategoryBulk,
  getCatEdit,
  renderCategoryItemUI
}: FinanceSettingsProps) {

  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCatName.trim();
    if (!val) return;
    if (!financeCategoryPrefs[val]) {
      updateCategoryPref(val, { iconName: 'Tag', color: '#a8a29e' });
      playSuccess();
    }
    setNewCatName("");
    setShowAddCat(false);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || financeMappings[newGroupName.trim()]) return;
    updateFinanceMapping(newGroupName.trim(), []);
    setNewGroupName("");
    setShowAddGroup(false);
    playSuccess();
  };

  const handleToggleMember = (cat: string) => {
    if (!managedGroup) return;
    const members = financeMappings[managedGroup] || [];
    if (members.includes(cat)) {
      updateFinanceMapping(managedGroup, members.filter(c => c !== cat));
    } else {
      // Remove from other group first
      const currentGroup = categoryToGroup[cat];
      if (currentGroup) {
        updateFinanceMapping(currentGroup, financeMappings[currentGroup].filter(c => c !== cat));
      }
      updateFinanceMapping(managedGroup, [...members, cat]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">Grup Kategori</h3>
            <p className="text-stone-500 text-sm">Organisir kategori ke dalam grup besar.</p>
          </div>
          <Folder className="w-8 h-8 text-stone-900 opacity-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {existingGroups.map(group => (
            <div key={group} className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-brutal">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative group/btn">
                      <button
                        onClick={() => setPickingIconFor(group)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform active:scale-95"
                        style={{ backgroundColor: (categoryEdits[group] || financeCategoryPrefs[group] || { color: '#78716c' }).color }}
                      >
                        {React.createElement((LucideIcons as any)[(categoryEdits[group] || financeCategoryPrefs[group] || {}).iconName] || LucideIcons.Folder, { className: "w-5 h-5" })}
                      </button>
                      <button
                        onClick={() => setPickingColorFor(group)}
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border-2 border-stone-900 rounded-full flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-sm"
                        title="Edit Warna"
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: (categoryEdits[group] || financeCategoryPrefs[group] || { color: '#78716c' }).color }} />
                      </button>
                    </div>
                   <h4 className="font-bold text-stone-900">{group}</h4>
                </div>
                <ActionMenu 
                  items={[
                    { label: "Kelola Anggota", icon: <Settings className="w-4 h-4" />, onClick: () => setManagedGroup(group) },
                    { label: "Hapus Grup", icon: <Trash2 className="w-4 h-4" />, onClick: () => showConfirm(`Hapus grup "${group}"?`, () => { deleteFinanceMapping(group); playError(); }), variant: "danger" }
                  ]}
                  triggerClassName="p-2 hover:bg-stone-50 rounded-xl transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {financeMappings[group].map((cat, idx) => {
                   const pref = financeCategoryPrefs[cat] || {};
                   const IconComp = (LucideIcons as any)[pref.iconName] || LucideIcons.Tag;
                   return (
                    <div key={`${cat}-${idx}`} className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg group/cat transition-all hover:bg-stone-100">
                      <div className="w-4 h-4 rounded flex items-center justify-center text-white shrink-0" style={{ backgroundColor: pref.color || '#a8a29e' }}>
                        <IconComp className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">{cat}</span>
                    </div>
                   );
                })}
                {financeMappings[group].length === 0 && <p className="text-[10px] text-stone-300 italic font-bold">Belum ada kategori</p>}
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => { playClick(); setShowAddGroup(true); }}
            className="border-2 border-dashed border-stone-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 hover:border-stone-900 hover:bg-stone-50 transition-all group"
          >
            <div className="w-10 h-10 bg-white border-2 border-stone-200 rounded-xl flex items-center justify-center group-hover:border-stone-900 transition-colors">
               <Plus className="w-5 h-5 text-stone-400 group-hover:text-stone-900" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-stone-900">Buat Grup Baru</span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">Semua Kategori</h3>
            <p className="text-stone-500 text-sm">Sesuaikan nama, ikon, dan warna latar.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { playClick(); setShowAddCat(true); }}
              className="flex items-center gap-2 bg-stone-900 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-stone-800 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 md:w-4 h-4" /> Kategori Baru
            </button>
            <Tag className="w-8 h-8 text-stone-900 opacity-10 hidden sm:block" />
          </div>
        </div>

        <div className="bg-white border-2 border-stone-900 rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-8 shadow-brutal overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
             {allCategories.map((cat, idx) => (
               <div key={`cat-${cat}-${idx}`} className="p-2 md:p-4 border border-stone-100 rounded-xl md:rounded-2xl hover:border-stone-200 transition-all shadow-sm">
                  {renderCategoryItemUI(cat, getCatEdit(cat))}
               </div>
             ))}
             {allCategories.length === 0 && (
               <div className="col-span-full py-12 text-center">
                 <Tag className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                 <p className="text-stone-400 font-bold italic">Belum ada kategori ditemukan</p>
               </div>
             )}
          </div>
        </div>
      </section>

      {/* Add Group Modal */}
      <AnimatePresence>
        {showAddGroup && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddGroup(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] border-[3px] border-stone-900 p-6 md:p-8 shrink-0 max-w-sm w-full relative z-10 shadow-brutal">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-serif text-xl font-bold text-stone-900">Grup Baru</h4>
                <button onClick={() => setShowAddGroup(false)} className="p-1 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5 text-stone-400" /></button>
              </div>
              <form onSubmit={handleAddGroup} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">Nama Grup</label>
                  <input 
                    type="text" 
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)} 
                    placeholder="Contoh: Kebutuhan Rumah"
                    className="w-full bg-stone-50 border-2 border-stone-100 focus:border-stone-900 rounded-xl px-4 py-3 outline-none font-bold text-xs transition-colors"
                    required 
                    autoFocus
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-lg active:scale-95">
                  Buat Grup
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showAddCat && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddCat(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] border-[3px] border-stone-900 p-6 md:p-8 shrink-0 max-w-sm w-full relative z-10 shadow-brutal">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-serif text-xl font-bold text-stone-900">Kategori Baru</h4>
                <button onClick={() => setShowAddCat(false)} className="p-1 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5 text-stone-400" /></button>
              </div>
              <form onSubmit={handleAddCat} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">Nama Kategori</label>
                  <input 
                    type="text" 
                    value={newCatName} 
                    onChange={e => setNewCatName(e.target.value)} 
                    placeholder="Contoh: Kopi, Bensin, dll"
                    className="w-full bg-stone-50 border-2 border-stone-100 focus:border-stone-900 rounded-xl px-4 py-3 outline-none font-bold text-xs transition-colors"
                    required 
                    autoFocus
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-lg active:scale-95">
                  Tambah Kategori
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Manage Group Members Modal */}
        {managedGroup && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManagedGroup(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] border-[3px] border-stone-900 p-6 md:p-8 shrink-0 max-w-lg w-full relative z-10 shadow-brutal max-h-[85vh] flex flex-col pt-8">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h4 className="font-serif text-2xl font-black text-stone-900">Kelola Anggota</h4>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Grup Aktif: <span className="text-stone-700">{managedGroup}</span></p>
                </div>
                <button onClick={() => setManagedGroup(null)} className="w-10 h-10 border-2 border-stone-200 hover:border-stone-900 hover:bg-stone-50 rounded-xl flex items-center justify-center transition-all shadow-sm"><X className="w-5 h-5 text-stone-600" /></button>
              </div>
              
              <div className="mb-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const val = (e.target as any).catName.value.trim();
                  if (!val) return;
                  if (financeMappings[managedGroup]?.includes(val)) return;
                  
                  // Add to mapping
                  const currentGroup = Object.keys(financeMappings).find(g => financeMappings[g].includes(val));
                  if (currentGroup) {
                     updateFinanceMapping(currentGroup, financeMappings[currentGroup].filter((c: string) => c !== val));
                  }
                  const members = financeMappings[managedGroup] || [];
                  updateFinanceMapping(managedGroup, [...members, val]);
                  
                  // Set default icon and color
                  if (!financeCategoryPrefs[val]) {
                    updateCategoryPref(val, {
                      iconName: 'Tag',
                      color: '#a8a29e'
                    });
                  }
                  
                  (e.target as any).catName.value = "";
                  playSuccess();
                }} className="flex gap-2">
                  <input name="catName" type="text" placeholder="Catat Kategori Baru..." className="flex-1 bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-900 font-bold text-sm transition-colors" />
                  <button type="submit" className="bg-stone-900 text-white px-5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-colors pointer-events-auto flex items-center justify-center shadow-lg"><Plus className="w-5 h-5" /></button>
                </form>
              </div>

              <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1">
                {allCategories.map((cat, idx) => {
                  const isMember = financeMappings[managedGroup]?.includes(cat);
                  const currentGroup = categoryToGroup[cat];
                  return (
                    <div key={`manage-${cat}-${idx}`} className={cn("flex items-center justify-between p-4 border-2 rounded-2xl transition-all shadow-sm", isMember ? "border-stone-900 bg-stone-50" : "border-stone-100 bg-white hover:border-stone-300")}>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-white" style={{ backgroundColor: financeCategoryPrefs[cat]?.color || '#a8a29e' }}>
                           {React.createElement((LucideIcons as any)[financeCategoryPrefs[cat]?.iconName] || LucideIcons.Tag, { className: "w-5 h-5" })}
                         </div>
                         <div>
                           <p className="font-bold text-base text-stone-900">{cat}</p>
                           {currentGroup && currentGroup !== managedGroup && (
                             <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-0.5">Saat ini: {currentGroup}</p>
                           )}
                         </div>
                      </div>
                       <button
                         onClick={() => { playClick(); handleToggleMember(cat); }}
                         className={cn(
                           "min-w-24 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                           isMember ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white" : "bg-white border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white shadow-[0_4px_0_0_rgba(28,25,23,1)] active:shadow-none active:translate-y-1"
                         )}
                       >
                         {isMember ? "Keluarkan" : "Masukkan"}
                       </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Icon Picker Modal */}
        {pickingIconFor && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-2 sm:p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPickingIconFor(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 border-stone-900 p-4 md:p-8 shrink-0 max-w-2xl w-full relative z-10 shadow-brutal max-h-[90vh] flex flex-col pt-12">
               <div className="flex items-center justify-between mb-6 shrink-0 pt-2 px-2">
                 <div>
                   <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 leading-tight">Pilih Ikon</h3>
                   <div className="flex items-center gap-3 mt-4 p-2.5 bg-stone-50 border border-stone-100 rounded-2xl">
                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition-transform" style={{ backgroundColor: (categoryEdits[pickingIconFor] || financeCategoryPrefs[pickingIconFor] || { color: '#a8a29e' }).color }}>
                        {React.createElement((LucideIcons as any)[(categoryEdits[pickingIconFor] || financeCategoryPrefs[pickingIconFor] || {}).iconName] || LucideIcons.HelpCircle, { className: "w-5 h-5 md:w-6 md:h-6" })}
                     </div>
                     <div className="min-w-0">
                       <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Preview</p>
                       <p className="font-bold text-stone-900 text-xs md:text-sm truncate max-w-[120px] md:max-w-none">{pickingIconFor}</p>
                     </div>
                   </div>
                 </div>
                 <button onClick={() => setPickingIconFor(null)} className="w-10 h-10 md:w-12 md:h-12 border-2 border-stone-100 hover:border-stone-900 rounded-xl flex items-center justify-center transition-all bg-white"><X className="w-5 h-5 md:w-6 md:h-6 text-stone-500" /></button>
               </div>
               
               <div className="overflow-y-auto space-y-8 pr-2 custom-scrollbar pb-8 px-2">
                 {ICON_GROUPS.map((group, idx) => (
                   <div key={idx} className="space-y-3">
                     <div className="sticky top-0 bg-white py-1.5 z-10 flex items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 whitespace-nowrap">{group.label}</p>
                        <div className="h-px flex-1 bg-stone-100" />
                     </div>
                     <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-1.5 md:gap-2">
                       {group.icons.map((iconName, iconIdx) => {
                         const IconComp = (LucideIcons as any)[iconName];
                         if (!IconComp) return null;
                         const isSelected = (categoryEdits[pickingIconFor] || financeCategoryPrefs[pickingIconFor] || {}).iconName === iconName;
                         return (
                           <button
                             key={`${iconName}-${iconIdx}`}
                             onClick={() => {
                               const obj = pickingIconFor;
                               if (obj) {
                                 const current = getCatEdit(obj);
                                 setCategoryEdits((p: any) => ({ ...p, [obj]: { ...current, iconName } }));
                                 updateCategoryPref(obj, { iconName, color: current.color });
                               }
                               setPickingIconFor(null);
                               playSuccess();
                             }}
                             className={cn(
                               "aspect-square flex items-center justify-center border-2 rounded-[0.75rem] transition-all group relative",
                               isSelected 
                                ? "bg-stone-900 border-stone-900 text-white shadow-md scale-105" 
                                : "bg-stone-50/50 border-stone-100 hover:border-stone-400 text-stone-400 hover:text-stone-900"
                             )}
                             title={iconName}
                           >
                             <IconComp className={cn("w-4.5 h-4.5 md:w-5 md:h-5 transition-transform group-hover:scale-110", isSelected && "animate-pulse")} />
                           </button>
                         );
                       })}
                     </div>
                   </div>
                 ))}
               </div>
             </motion.div>
          </div>
        )}

        {/* Color Picker Modal */}
        {pickingColorFor && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPickingColorFor(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border-[3px] border-stone-900 p-6 md:p-8 shrink-0 max-w-sm w-full relative z-10 shadow-brutal flex flex-col pt-10">
               <div className="flex items-center justify-between mb-8 shrink-0">
                 <div>
                   <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">Pilih Warna</h3>
                   <div className="flex items-center gap-3 mt-4 p-3 bg-stone-50 border border-stone-100 rounded-2xl overflow-hidden">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl transition-colors duration-300" style={{ backgroundColor: (categoryEdits[pickingColorFor] || financeCategoryPrefs[pickingColorFor] || { color: '#a8a29e' }).color }}>
                        {React.createElement((LucideIcons as any)[(categoryEdits[pickingColorFor] || financeCategoryPrefs[pickingColorFor] || {}).iconName] || LucideIcons.Palette, { className: "w-6 h-6" })}
                     </div>
                     <div className="min-w-0">
                       <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Preview</p>
                       <p className="font-bold text-stone-900 text-sm truncate">{pickingColorFor}</p>
                     </div>
                   </div>
                 </div>
                 <button onClick={() => setPickingColorFor(null)} className="w-10 h-10 border border-stone-200 hover:border-stone-900 rounded-xl flex items-center justify-center transition-all bg-white"><X className="w-5 h-5 text-stone-600" /></button>
               </div>
               
               <div className="grid grid-cols-5 gap-2 md:gap-3 pb-4">
                 {COLORS.map(color => {
                   const isSelected = (categoryEdits[pickingColorFor] || financeCategoryPrefs[pickingColorFor] || { color: '' }).color === color;
                   return (
                    <button
                      key={color}
                      onClick={() => {
                        const obj = pickingColorFor;
                        if (obj) {
                          const current = getCatEdit(obj);
                          const newVal = { ...current, color };
                          setCategoryEdits((p: any) => ({ ...p, [obj]: newVal }));
                          updateCategoryPref(obj, { iconName: current.iconName, color });
                        }
                        setPickingColorFor(null);
                        playSuccess();
                      }}
                      className={cn(
                        "aspect-square rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm border-[3px]",
                        isSelected ? "border-stone-900 ring-2 ring-stone-900 ring-offset-2" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                   );
                 })}
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
