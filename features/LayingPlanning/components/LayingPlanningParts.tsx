'use client'

import { Button } from '@/app/components/ui/Button'
import { GroupParts, Parts } from '../types'

interface LayingPlanningPartsProps {
  parts: Parts[]
  groupParts: GroupParts[]
  lotCode: string
  layingPlanningId: string | number
  router: any
}

export const LayingPlanningParts = ({
  parts,
  groupParts,
  lotCode,
  layingPlanningId,
  router,
}: LayingPlanningPartsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Parts Component Setup
        </h3>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            Total Parts:{' '}
            {(groupParts.length > 0 ? groupParts : parts)?.length || 0}
          </div>
          <Button className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-900/20 transition-all hover:-translate-y-0.5">
            Add Part
          </Button>
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
            (groupParts?.length === 0 && parts?.length === 0) ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest"
                >
                  No parts available
                </td>
              </tr>
            ) : (
              (groupParts.length > 0 ? groupParts : parts).map((p: any) => {
                const partName = p.itemPart ?? p.item_part ?? 'N/A'
                const partLinkId = p.layingPlanningId ?? p.laying_planning_id

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-zinc-800">
                      {partName}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-700">
                      {lotCode}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        onClick={() => {
                          if (partLinkId) {
                            router.push(`/admin/laying-planning/${partLinkId}`)
                          }
                        }}
                        variant="ghost"
                        className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 border border-blue-100/50"
                        disabled={
                          !partLinkId || partLinkId === layingPlanningId
                        }
                      >
                        {partLinkId === layingPlanningId ? 'Current' : 'Detail'}
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
