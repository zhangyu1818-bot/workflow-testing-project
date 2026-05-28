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

  it('applies VIP15 discount case-insensitively', () => {
    const totals = calculateCartTotals(
      [
        {
          sku: 'FRAME-1',
          name: 'Demo frame',
          unitPriceCents: 3333,
          quantity: 1,
        },
      ],
      'vip15',
    )

    expect(totals).toEqual({
      subtotalCents: 3333,
      discountCents: 500,
      shippingCents: 799,
      totalCents: 3632,
    })
  })

  it('trims VIP15 promo code before matching', () => {
    const totals = calculateCartTotals(
      [
        {
          sku: 'FRAME-1',
          name: 'Demo frame',
          unitPriceCents: 3333,
          quantity: 1,
        },
      ],
      '  VIP15  ',
    )

    expect(totals.discountCents).toBe(500)
  })

  it('keeps WELCOME5 discount behavior unchanged', () => {
    const totals = calculateCartTotals(
      [
        {
          sku: 'FRAME-1',
          name: 'Demo frame',
          unitPriceCents: 1200,
          quantity: 1,
        },
      ],
      'WELCOME5',
    )

    expect(totals).toEqual({
      subtotalCents: 1200,
      discountCents: 500,
      shippingCents: 799,
      totalCents: 1499,
    })
  })

  it('charges shipping below the free shipping threshold', () => {
    expect(shippingCents(9900)).toBe(799)
  })
})
