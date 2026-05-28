import { describe, expect, it } from 'vitest'

import { buildOrderSummary } from '../src/order-summary.js'

describe('order summary', () => {
  it('renders a readable order summary', () => {
    const summary = buildOrderSummary({
      orderNumber: 'DEMO-1001',
      customerName: 'Ada',
      itemCount: 3,
      totals: {
        subtotalCents: 12000,
        discountCents: 1000,
        shippingCents: 0,
        totalCents: 11000,
      },
    })

    expect(summary).toContain('Item count: 3')
    expect(summary).toContain('Total: $110.00')
  })
})
