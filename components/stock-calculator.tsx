'use client'

import { useMemo, useState } from 'react'
import { Plus, Trash2, TrendingUp, Wallet, Coins } from 'lucide-react'
import { allocate, type StockInput } from '@/lib/allocate'

const fmt = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 2 })

let counter = 4

export function StockCalculator() {
  const [total, setTotal] = useState<string>('5000')
  const [stocks, setStocks] = useState<StockInput[]>([
    { id: 's1', name: 'Amoc', price: 8 },
    { id: 's2', name: 'Olfi', price: 23 },
    { id: 's3', name: 'Orwe', price: 24 },
    { id: 's4', name: 'Swdy', price: 87 },
  ])

  const totalNum = Number.parseFloat(total) || 0

  const result = useMemo(
    () => allocate(totalNum, stocks),
    [totalNum, stocks],
  )

  const addStock = () => {
    counter += 1
    setStocks((prev) => [...prev, { id: `s${counter}`, name: '', price: 0 }])
  }

  const removeStock = (id: string) => {
    setStocks((prev) => prev.filter((s) => s.id !== id))
  }

  const updateStock = (id: string, patch: Partial<StockInput>) => {
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const usagePercent =
    totalNum > 0 ? Math.round((result.totalSpent / totalNum) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      {/* الهيدر */}
      <header className="mb-8 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <TrendingUp className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            حاسبة الأسهم
          </h1>
          <p className="text-sm text-muted-foreground">
            وزّع مبلغك على الأسهم لتحقيق أقصى استفادة
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* عمود الإدخال */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {/* بانل المبلغ */}
          <section
            aria-labelledby="total-label"
            className="rounded-2xl bg-card p-6 shadow-sm"
          >
            <label
              id="total-label"
              htmlFor="total-input"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <Wallet className="size-4 text-muted-foreground" aria-hidden="true" />
              المبلغ الكلي اللي معاك
            </label>
            <div className="relative">
              <input
                id="total-input"
                type="number"
                inputMode="decimal"
                min={0}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full rounded-xl bg-input px-4 py-3 text-lg font-semibold text-foreground outline-none ring-ring/50 transition focus:ring-2"
                placeholder="0"
              />
              <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                جنيه
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              الشرط الأساسي: لا يقل الشراء لكل سهم عن 1,000 — والمتبقي يتوزع
              بالتساوي مع مراعاة سعر كل سهم
            </p>
          </section>

          {/* بانل الأسهم */}
          <section
            aria-labelledby="stocks-heading"
            className="rounded-2xl bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="stocks-heading"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Coins className="size-4 text-muted-foreground" aria-hidden="true" />
                الأسهم وأسعارها
              </h2>
              <button
                type="button"
                onClick={addStock}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                إضافة سهم
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {stocks.length === 0 && (
                <p className="rounded-xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                  مفيش أسهم — اضغط &quot;إضافة سهم&quot; للبدء
                </p>
              )}
              {stocks.map((stock, index) => (
                <div key={stock.id} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-center text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={stock.name}
                    onChange={(e) =>
                      updateStock(stock.id, { name: e.target.value })
                    }
                    placeholder="اسم السهم"
                    aria-label={`اسم السهم ${index + 1}`}
                    className="min-w-0 flex-1 rounded-xl bg-input px-3 py-2.5 text-sm font-medium text-foreground outline-none ring-ring/50 transition focus:ring-2"
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={stock.price || ''}
                    onChange={(e) =>
                      updateStock(stock.id, {
                        price: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="السعر"
                    aria-label={`سعر السهم ${index + 1}`}
                    className="w-16 shrink-0 rounded-xl bg-input px-2 py-2.5 text-sm font-semibold text-foreground outline-none ring-ring/50 transition focus:ring-2 sm:w-24 sm:px-3 md:w-28"
                  />
                  <button
                    type="button"
                    onClick={() => removeStock(stock.id)}
                    aria-label={`حذف السهم ${stock.name || index + 1}`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* عمود النتائج */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* كارت الملخص */}
          <section
            aria-label="ملخص التوزيع"
            className="rounded-2xl bg-secondary p-6 shadow-sm"
          >
            <h2 className="mb-1 text-sm font-semibold text-secondary-foreground">
              إجمالي المصروف
            </h2>
            <p className="text-4xl font-bold text-secondary-foreground">
              {fmt(result.totalSpent)}
            </p>
            <p className="mt-1 text-xs text-secondary-foreground/70">
              من أصل {fmt(totalNum)} — نسبة الاستفادة {usagePercent}%
            </p>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-secondary-foreground/15"
              role="progressbar"
              aria-valuenow={usagePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="نسبة الاستفادة من المبلغ"
            >
              <div
                className="h-full rounded-full bg-secondary-foreground transition-all"
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary-foreground/10 px-4 py-3">
              <span className="text-xs font-medium text-secondary-foreground">
                إجمالي عدد الأسهم
              </span>
              <span className="text-lg font-bold text-secondary-foreground">
                {fmt(result.totalShares)}
              </span>
            </div>
          </section>

          {/* كارت المتبقي */}
          <section
            aria-label="المبلغ المتبقي"
            className="rounded-2xl bg-accent p-6 shadow-sm"
          >
            <h2 className="mb-1 text-sm font-semibold text-accent-foreground">
              المبلغ المتبقي
            </h2>
            <p className="text-3xl font-bold text-accent-foreground">
              {fmt(result.remainder)}
            </p>
            <p className="mt-1 text-xs text-accent-foreground/70">
              {result.allocations.length > 0 &&
              result.remainder <
                Math.min(...result.allocations.map((a) => a.price))
                ? 'أقل من سعر أرخص سهم — أقصى استفادة متحققة'
                : 'باقي من المبلغ بعد التوزيع'}
            </p>
          </section>
        </div>
      </div>

      {/* جدول النتائج */}
      <section
        aria-labelledby="results-heading"
        className="mt-6 rounded-2xl bg-card p-6 shadow-sm"
      >
        <h2 id="results-heading" className="mb-4 text-sm font-semibold text-foreground">
          خطة الشراء المقترحة
        </h2>

        {result.error ? (
          <p className="rounded-xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
            {result.error}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs text-muted-foreground">
                  <th className="pb-3 pe-4 text-start font-medium">السهم</th>
                  <th className="pb-3 pe-4 text-start font-medium">سعر السهم</th>
                  <th className="pb-3 pe-4 text-start font-medium">عدد الأسهم للشراء</th>
                  <th className="pb-3 text-start font-medium">إجمالي التكلفة</th>
                </tr>
              </thead>
              <tbody>
                {result.allocations.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="py-3 pe-4 font-semibold text-foreground">
                      {a.name || '—'}
                    </td>
                    <td className="py-3 pe-4 text-muted-foreground">{fmt(a.price)}</td>
                    <td className="py-3 pe-4">
                      <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-secondary px-2.5 py-1 font-bold text-secondary-foreground">
                        {fmt(a.shares)}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-foreground">{fmt(a.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result.excluded.length > 0 && (
          <p className="mt-4 rounded-xl bg-accent/20 px-4 py-3 text-xs text-foreground leading-relaxed">
            تنبيه: المبلغ لا يكفي للحد الأدنى (1,000) للأسهم التالية فتم
            استبعادها:{' '}
            <span className="font-semibold">
              {result.excluded.map((s) => s.name || 'بدون اسم').join('، ')}
            </span>
          </p>
        )}
      </section>
    </div>
  )
}
