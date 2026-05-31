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

  it('applies VIP15 15% discount', () => {
    const totals = calculateCartTotals(
      [{ sku: 'FRAME-1', name: 'Demo frame', unitPriceCents: 6000, quantity: 2 }],
      'VIP15',
    )
    expect(totals.discountCents).toBe(1800)
  })

  it('applies VIP15 case-insensitively', () => {
    const lower = calculateCartTotals(
      [{ sku: 'FRAME-1', name: 'Demo frame', unitPriceCents: 6000, quantity: 2 }],
      'vip15',
    )
    const mixed = calculateCartTotals(
      [{ sku: 'FRAME-1', name: 'Demo frame', unitPriceCents: 6000, quantity: 2 }],
      'Vip15',
    )
    expect(lower.discountCents).toBe(1800)
    expect(mixed.discountCents).toBe(1800)
  })

  it('trims whitespace from VIP15 code', () => {
    const totals = calculateCartTotals(
      [{ sku: 'FRAME-1', name: 'Demo frame', unitPriceCents: 6000, quantity: 2 }],
      '  VIP15  ',
    )
    expect(totals.discountCents).toBe(1800)
  })
})
