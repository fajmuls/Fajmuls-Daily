import React from 'react';
import { Folder, Tag, Plus, Trash2, Edit3, Settings, ChevronRight, Save } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "../../lib/utils";
import { ActionMenu } from "../ActionMenu";
import { ICON_GROUPS } from "../../data";

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
                   <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                      <Folder className="w-5 h-5 text-stone-600" />
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
                {financeMappings[group].map(cat => (
                  <span key={cat} className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold text-stone-600 uppercase tracking-wider">{cat}</span>
                ))}
                {financeMappings[group].length === 0 && <p className="text-[10px] text-stone-300 italic font-bold">Belum ada kategori</p>}
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => playClick()} // Trigger add group modal
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
            <p className="text-stone-500 text-sm">Sesuaikan nama, ikon, dan grup.</p>
          </div>
          <Tag className="w-8 h-8 text-stone-900 opacity-10" />
        </div>

        <div className="bg-white border-2 border-stone-900 rounded-[2.5rem] p-6 shadow-brutal overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {allCategories.map(cat => (
               <div key={cat} className="p-4 border border-stone-100 rounded-2xl hover:border-stone-200 transition-all">
                  {renderCategoryItemUI(cat, getCatEdit(cat, false))}
               </div>
             ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => {
                Object.entries(categoryEdits).forEach(([cat, edit]: [any, any]) => {
                  updateCategoryPref(cat, { name: edit.name, iconName: edit.iconName, color: edit.color });
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
    </div>
  );
}
