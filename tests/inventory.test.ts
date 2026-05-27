import { describe, expect, it } from 'vitest'

import { inventoryStatus, reorderSuggestion } from '../src/inventory.js'

describe('inventory', () => {
  it('marks empty inventory as out of stock', () => {
    expect(
      inventoryStatus({
        sku: 'LENS-1',
        onHand: 0,
        reorderPoint: 5,
        reorderQuantity: 20,
      }),
    ).toBe('out_of_stock')
  })

  it('suggests reorder quantity for low stock items', () => {
    expect(
      reorderSuggestion({
        sku: 'FRAME-2',
        onHand: 3,
        reorderPoint: 5,
        reorderQuantity: 25,
      }),
    ).toBe(25)
  })
})
