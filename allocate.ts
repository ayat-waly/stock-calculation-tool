export interface StockInput {
  id: string
  name: string
  price: number
}

export interface StockAllocation {
  id: string
  name: string
  price: number
  shares: number
  cost: number
}

export interface AllocationResult {
  allocations: StockAllocation[]
  excluded: StockInput[]
  totalSpent: number
  remainder: number
  totalShares: number
  error?: string
}

const MIN_PER_STOCK = 1000

/**
 * توزيع المبلغ على الأسهم:
 * 1- كل سهم لازم يتصرف عليه 1000 على الأقل (أساس)
 * 2- المتبقي يتوزع بالتساوي على الأسهم مع مراعاة سعر كل سهم
 * 3- أي فَكّة متبقية تتصرف على أرخص الأسهم لتقليل الباقي لأقل من سعر أرخص سهم
 */
export function allocate(total: number, stocks: StockInput[]): AllocationResult {
  const valid = stocks.filter((s) => s.price > 0)

  if (valid.length === 0 || total <= 0) {
    return {
      allocations: [],
      excluded: [],
      totalSpent: 0,
      remainder: total,
      totalShares: 0,
      error: 'أدخل المبلغ وأسعار الأسهم أولاً',
    }
  }

  // التكلفة الأساسية لكل سهم (أقل عدد يحقق 1000 على الأقل)
  const withBase = valid.map((s) => {
    const baseShares = Math.ceil(MIN_PER_STOCK / s.price)
    return { ...s, baseShares, baseCost: baseShares * s.price }
  })

  // لتحديد أقصى عدد أسهم ممكن: نرتب بالأرخص أساسًا وندخل الأسهم واحدًا واحدًا
  const sortedByBase = [...withBase].sort((a, b) => a.baseCost - b.baseCost)
  const included: typeof withBase = []
  let baseTotal = 0
  for (const s of sortedByBase) {
    if (baseTotal + s.baseCost <= total) {
      included.push(s)
      baseTotal += s.baseCost
    }
  }

  const excluded = withBase
    .filter((s) => !included.some((i) => i.id === s.id))
    .map(({ id, name, price }) => ({ id, name, price }))

  if (included.length === 0) {
    return {
      allocations: [],
      excluded,
      totalSpent: 0,
      remainder: total,
      totalShares: 0,
      error: `المبلغ لا يكفي للحد الأدنى (${MIN_PER_STOCK.toLocaleString()}) لأي سهم`,
    }
  }

  // خريطة عدد الأسهم لكل سهم
  const sharesMap = new Map<string, number>()
  for (const s of included) sharesMap.set(s.id, s.baseShares)

  let remaining = total - baseTotal

  // توزيع المتبقي بالتساوي على الأسهم مع مراعاة السعر
  const perStock = remaining / included.length
  for (const s of included) {
    const extra = Math.floor(perStock / s.price)
    if (extra > 0) {
      sharesMap.set(s.id, (sharesMap.get(s.id) ?? 0) + extra)
      remaining -= extra * s.price
    }
  }

  // صرف الفَكّة المتبقية على أرخص الأسهم (بالتناوب) حتى يقل الباقي عن أرخص سعر
  const byPrice = [...included].sort((a, b) => a.price - b.price)
  let bought = true
  while (bought) {
    bought = false
    for (const s of byPrice) {
      if (s.price <= remaining) {
        sharesMap.set(s.id, (sharesMap.get(s.id) ?? 0) + 1)
        remaining -= s.price
        bought = true
      }
    }
  }

  // بناء النتيجة بترتيب الإدخال الأصلي
  const allocations: StockAllocation[] = valid
    .filter((s) => sharesMap.has(s.id))
    .map((s) => {
      const shares = sharesMap.get(s.id) ?? 0
      return { id: s.id, name: s.name, price: s.price, shares, cost: shares * s.price }
    })

  const totalSpent = allocations.reduce((sum, a) => sum + a.cost, 0)
  const totalShares = allocations.reduce((sum, a) => sum + a.shares, 0)

  return {
    allocations,
    excluded,
    totalSpent,
    remainder: total - totalSpent,
    totalShares,
  }
}
