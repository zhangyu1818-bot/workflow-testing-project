import { describe, expect, it } from 'vitest'

import { calculateCartTotals, shippingCents } from '../src/pricing.js'

describe('pricing', () => {
  it('calculates subtotal, discount, shipping, and total', () => {
    const totals = calculateCartTotals(
      [
        {
          sku: 'FRAME-1',
          name: 'Demo frame',
          unitPriceCents: 6000,
          quantity: 2,
        },
      ],
      'DEMO10',
    )

    expect(totals).toEqual({
      subtotalCents: 12000,
      discountCents: 1200,
      shippingCents: 0,
      totalCents: 10800,
    })
  })

  it('charges shipping below the free shipping threshold', () => {
    expect(shippingCents(9900)).toBe(799)
  })
})
