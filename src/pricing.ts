export interface CartItem {
  sku: string
  name: string
  unitPriceCents: number
  quantity: number
  category?: string
}

export interface CartTotals {
  subtotalCents: number
  discountCents: number
  shippingCents: number
  totalCents: number
}

export function subtotalCents(items: readonly CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0,
  )
}

export function discountForCodeCents(
  subtotal: number,
  code: string | null,
): number {
  if (!code) return 0
  const normalized = code.trim().toUpperCase()
  if (normalized === 'DEMO10') return Math.round(subtotal * 0.1)
  if (normalized === 'WELCOME5') return 500
  return 0
}

export function shippingCents(subtotal: number): number {
  return subtotal >= 10000 ? 0 : 799
}

export function calculateCartTotals(
  items: readonly CartItem[],
  promoCode: string | null = null,
): CartTotals {
  const subtotal = subtotalCents(items)
  const discount = Math.min(discountForCodeCents(subtotal, promoCode), subtotal)
  const shipping = shippingCents(subtotal)
  return {
    subtotalCents: subtotal,
    discountCents: discount,
    shippingCents: shipping,
    totalCents: subtotal - discount + shipping,
  }
}
