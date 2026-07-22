'use client'
import { Button } from '@/app/components/ui/Button'
import { SizeItem } from '@/features/LayingPlanning/types'
// Definisikan bentuk props secara utuh
interface LayingPlanningSizeAllocationProps {
  sizes: SizeItem[]
  totalQty: number
  totalCutMap?: Record<string, number> // Tambahkan ini agar tidak error 'variable not found'
}

export const LayingPlanningSizeAllocation = ({
  sizes = [],
  totalCutMap = {},
}: LayingPlanningSizeAllocationProps) => {
  // Hitung total cut dari map
  const totalQty = sizes.reduce(
    (sum: number, s: SizeItem) => sum + (s.order_qty || 0),
    0,
  )

  const grandTotalCut = Object.values(totalCutMap).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Size Allocation Breakdown
        </h3>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            Total Quantities: {totalQty}
          </div>
          <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-900/20 transition-all hover:-translate-y-0.5">
            Add Size
          </Button>
        </div>
      </div>
      <div className="border border-zinc-100 rounded-xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/80 border-b border-zinc-100 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">
            <tr>
              <th className="px-6 py-4">Size Code</th>
              <th className="px-6 py-4 text-center">Order Quantity</th>
              <th className="px-6 py-4 text-center">Total Cut</th>
              <th className="px-6 py-4 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {sizes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest"
                >
                  No sizes available
                </td>
              </tr>
            ) : (
              sizes.map((sz: SizeItem) => {
                const orderQty = sz.order_qty || 0
                const cutQty = totalCutMap[String(sz.size_id || sz.id)] || 0
                const remaining = orderQty - cutQty
                const sizeLabel =
                  typeof sz.size === 'string'
                    ? sz.size
                    : sz.size?.size ||
                      sz.size?.size_code ||
                      sz.size?.name ||
                      'Unknown'

                return (
                  <tr
                    key={sz.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-zinc-800">
                      {sizeLabel}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-700 text-center">
                      {orderQty}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600 text-center">
                      {cutQty}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-700 text-right">
                      {remaining}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          <tbody className="bg-zinc-900 text-white">
            <tr>
              <td className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white/50">
                Total Allocated
              </td>
              <td className="px-6 py-4 text-[14px] font-bold text-white text-center">
                {totalQty} pcs
              </td>
              <td className="px-6 py-4 text-[14px] font-bold text-blue-300 text-center">
                {grandTotalCut} pcs
              </td>
              <td className="px-6 py-4 text-[14px] font-bold text-white text-right">
                {totalQty - grandTotalCut} pcs
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
