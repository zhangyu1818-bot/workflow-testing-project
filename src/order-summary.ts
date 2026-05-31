import type { CartTotals } from './pricing.js'

export interface OrderSummaryInput {
  orderNumber: string
  customerName: string
  itemCount: number
  totals: CartTotals
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function buildOrderSummary(input: OrderSummaryInput): string {
  return [
    `Order ${input.orderNumber}`,
    `Customer: ${input.customerName}`,
    `Item count: ${input.itemCount}`,
    `Subtotal: ${formatMoney(input.totals.subtotalCents)}`,
    `Discount: ${formatMoney(input.totals.discountCents)}`,
    `Shipping: ${formatMoney(input.totals.shippingCents)}`,
    `Total: ${formatMoney(input.totals.totalCents)}`,
  ].join('\n')
}
