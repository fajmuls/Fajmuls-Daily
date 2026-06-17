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
  getCatEdit: (cat: string, isIncome: boolean) => any;
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

  const existingGroups = Object.keys(financeMappings).sort();
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

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
                {financeMappings[group].map(cat => {
                   const pref = financeCategoryPrefs[cat] || {};
                   const IconComp = (LucideIcons as any)[pref.iconName] || LucideIcons.Tag;
                   return (
                    <div key={cat} className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg group/cat transition-all hover:bg-stone-100">
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
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">Semua Kategori</h3>
            <p className="text-stone-500 text-sm">Sesuaikan nama, ikon, dan warna latar.</p>
          </div>
          <Tag className="w-8 h-8 text-stone-900 opacity-10" />
        </div>

        <div className="bg-white border-2 border-stone-900 rounded-[2.5rem] p-6 shadow-brutal overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {allCategories.map(cat => (
               <div key={cat} className="p-4 border border-stone-100 rounded-2xl hover:border-stone-200 transition-all shadow-sm">
                  {renderCategoryItemUI(cat, getCatEdit(cat, false))}
               </div>
             ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => {
                Object.entries(categoryEdits).forEach(([name, edit]: [string, any]) => {
                  updateCategoryPref(name, { iconName: edit.iconName, color: edit.color });
                });
                setCategoryEdits({});
                playSuccess();
              }}
              className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> Simpan Semua Perubahan
            </button>
          </div>
        </div>
      </section>

      {/* Add Group Modal */}
      <AnimatePresence>
        {showAddGroup && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddGroup(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] border-2 border-stone-900 p-6 md:p-8 shrink-0 max-w-sm w-full relative z-10 shadow-2xl">
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                    required 
                    autoFocus
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-colors">
                  Buat Grup
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Manage Group Members Modal */}
        {managedGroup && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManagedGroup(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] border-2 border-stone-900 p-6 md:p-8 shrink-0 max-w-lg w-full relative z-10 shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                  <h4 className="font-serif text-xl font-bold text-stone-900">Kelola Anggota</h4>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Grup: {managedGroup}</p>
                </div>
                <button onClick={() => setManagedGroup(null)} className="p-1 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5 text-stone-400" /></button>
              </div>
              
              <div className="overflow-y-auto pr-2 space-y-2">
                {allCategories.map(cat => {
                  const isMember = financeMappings[managedGroup]?.includes(cat);
                  const currentGroup = categoryToGroup[cat];
                  return (
                    <div key={cat} className="flex items-center justify-between py-2 border-b border-stone-100">
                      <div>
                        <p className="font-bold text-sm text-stone-900">{cat}</p>
                        {currentGroup && currentGroup !== managedGroup && (
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Saat ini: {currentGroup}</p>
                        )}
                      </div>
                       <button
                         onClick={() => { playClick(); handleToggleMember(cat); }}
                         className={cn(
                           "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                           isMember ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-stone-900 text-white hover:scale-105"
                         )}
                       >
                         {isMember ? "Hapus" : "Tambah"}
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
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPickingIconFor(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] border-2 border-stone-900 p-6 md:p-8 shrink-0 max-w-2xl w-full relative z-10 shadow-brutal max-h-[85vh] flex flex-col">
               <div className="flex items-center justify-between mb-6 shrink-0">
                 <h3 className="font-serif text-2xl font-bold text-stone-900">Pilih Ikon Baru</h3>
                 <button onClick={() => setPickingIconFor(null)} className="p-2 hover:bg-stone-100 rounded-xl transition-colors"><X className="w-5 h-5 text-stone-500" /></button>
               </div>
               <div className="overflow-y-auto space-y-8 pr-2">
                 {ICON_GROUPS.map((group, idx) => (
                   <div key={idx}>
                     <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">{group.label}</p>
                     <div className="flex gap-2 flex-wrap">
                       {group.icons.map(iconName => {
                         const IconComp = (LucideIcons as any)[iconName];
                         if (!IconComp) return null;
                         return (
                           <button
                             key={iconName}
                             onClick={() => {
                               const obj = pickingIconFor;
                               if (obj) {
                                 const current = getCatEdit(obj, false);
                                 setCategoryEdits((p: any) => ({ ...p, [obj]: { ...current, iconName } }));
                               }
                               setPickingIconFor(null);
                               playSuccess();
                             }}
                             className="p-3 bg-stone-50 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors text-stone-600 hover:text-stone-900"
                           >
                             <IconComp className="w-6 h-6" />
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
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] border-2 border-stone-900 p-6 md:p-8 shrink-0 max-w-sm w-full relative z-10 shadow-brutal flex flex-col">
               <div className="flex items-center justify-between mb-6 shrink-0">
                 <h3 className="font-serif text-xl font-bold text-stone-900">Pilih Warna</h3>
                 <button onClick={() => setPickingColorFor(null)} className="p-2 hover:bg-stone-100 rounded-xl transition-colors"><X className="w-5 h-5 text-stone-500" /></button>
               </div>
               <div className="flex flex-wrap gap-3">
                 {COLORS.map(color => (
                   <button
                     key={color}
                     onClick={() => {
                       const obj = pickingColorFor;
                       if (obj) {
                         const current = getCatEdit(obj, false);
                         const newVal = { ...current, color };
                         setCategoryEdits((p: any) => ({ ...p, [obj]: newVal }));
                       }
                       setPickingColorFor(null);
                       playSuccess();
                     }}
                     className="w-12 h-12 rounded-xl transition-transform hover:scale-110 active:scale-95 shadow-sm border border-black/10"
                     style={{ backgroundColor: color }}
                   />
                 ))}
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
