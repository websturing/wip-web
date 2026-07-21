'use client'

import { GroupParts, Parts } from "../types";


export const LayingPlanningParts = ({ parts, groupParts }: { parts: Parts[]; groupParts: GroupParts[] }) => {
  return (
  <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                     Parts Component Setup
                   </h3>
                   
                   <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                     Total Parts:{' '}
                     {(groupParts.length > 0
                       ? groupParts
                       : parts
                     )?.length || 0}
                   </div>
                 </div>
 
                 <div className="border border-zinc-100 rounded-xl overflow-hidden shadow-sm bg-white">
                   <table className="w-full text-left">
                     <thead className="bg-zinc-50/80 border-b border-zinc-100 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">
                       <tr>
                         <th className="px-6 py-4">Part Name</th>
                         <th className="px-6 py-4">GL (Lot)</th>
                         <th className="px-6 py-4 text-center w-24">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-50">
                       {(!groupParts && !parts) ||
                       (groupParts?.length === 0 &&
                         parts?.length === 0) ? (
                         <tr>
                           <td
                             colSpan={3}
                             className="px-6 py-8 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest"
                           >
                             No parts available
                           </td>
                         </tr>
                       ) : (
                         (groupParts.length > 0
                           ? groupParts
                           : parts
                         ).map((p: any) => (
                           <tr
                             key={p.id}
                             className="hover:bg-blue-50/30 transition-colors"
                           >
                             <td className="px-6 py-4 text-sm font-bold text-zinc-800">
                               {p.item_part}
                             </td>
                             <td className="px-6 py-4 text-sm font-bold text-zinc-700">
                           
                             </td>
                             <td className="px-6 py-4 text-center">
                               
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
      )}