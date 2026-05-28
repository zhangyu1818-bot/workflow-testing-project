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
    expect(shippingCents(9899)).toBe(799)
  })

  it('grants free shipping at and above $99', () => {
    expect(shippingCents(9900)).toBe(0)
    expect(shippingCents(10000)).toBe(0)
  })
})
