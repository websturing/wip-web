'use client';

import { Icon } from '@/app/components/ui/Icon';
import { Button } from '@/app/components/ui/Button';

interface MenuManagementProps {
    menus: any[];
    onAddMenu: () => void;
    onEditMenu: (menu: any) => void;
    onDeleteMenu: (id: string) => void;
}

export const MenuManagement = ({ menus, onAddMenu, onEditMenu, onDeleteMenu }: MenuManagementProps) => {
    // Function to render menus recursively
    const renderMenuTree = (menuList: any[], level = 0) => {
        return menuList.map((menu) => (
            <div key={menu.id} className="w-full">
                <div className={`flex items-center justify-between p-4 border-b border-zinc-100 hover:bg-zinc-50/50 transition-all ${level > 0 ? 'bg-zinc-50/20' : 'bg-white'}`}>
                    <div className="flex items-center gap-4" style={{ paddingLeft: `${level * 2}rem` }}>
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                            <Icon icon={menu.icon || 'solar:folder-bold-duotone'} className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-[13px] font-black text-zinc-900 uppercase tracking-tight">{menu.name}</h4>
                                {menu.platform === 'web' && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100">WEB</span>}
                                {menu.platform === 'mobile' && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-100">MOBILE</span>}
                                {menu.platform === 'both' && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">BOTH</span>}
                            </div>
                            <p className="text-[10px] font-bold text-zinc-400 font-mono mt-0.5">{menu.path}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-zinc-900">{menu.sort_order}</span>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Order</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEditMenu(menu)}
                                className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 flex items-center justify-center transition-all shadow-sm"
                            >
                                <Icon icon="solar:pen-bold-duotone" className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => onDeleteMenu(menu.id.toString())}
                                className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center transition-all shadow-sm"
                            >
                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
                {menu.children && menu.children.length > 0 && (
                    <div className="w-full">
                        {renderMenuTree(menu.children, level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    // Filter to only top-level menus, as the API might return a flat or nested list depending on how it was requested
    // Wait, getMenus/all endpoint returns all menus. If it's a flat list, we need to build the tree.
    // Let's build a tree from a flat list just in case, or assume it's nested if parent_id is used.
    // The backend `all` method currently returns `Menu::with('children')->whereNull('parent_id')->orderBy('sort_order')->get();`.
    // Yes! So it is already nested.

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200">
                        <Icon icon="solar:hamburger-menu-bold-duotone" className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Navigation Architecture</h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Design the sidebar hierarchy and platform routing.</p>
                    </div>
                </div>
                <Button
                    onClick={onAddMenu}
                    className="bg-zinc-900 text-white rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                >
                    <Icon icon="solar:add-circle-bold-duotone" className="w-4 h-4" />
                    Create Menu
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between px-8 py-4 bg-zinc-50/50 border-b border-zinc-100">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Menu Structure</span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mr-[120px]">Configuration</span>
                    </div>
                    <div className="flex flex-col w-full">
                        {menus.length > 0 ? renderMenuTree(menus) : (
                            <div className="p-12 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest">
                                No menus defined.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
