import { describe, expect, it } from 'vitest'

import { buildOrderSummary } from '../src/order-summary.js'

describe('order summary', () => {
  it('renders a readable order summary', () => {
    expect(
      buildOrderSummary({
        orderNumber: 'DEMO-1001',
        customerName: 'Ada',
        totals: {
          subtotalCents: 12000,
          discountCents: 1000,
          shippingCents: 0,
          totalCents: 11000,
        },
      }),
    ).toContain('Total: $110.00')
  })
})
