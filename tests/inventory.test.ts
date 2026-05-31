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

  it('marks inventory at the reorder point as low stock', () => {
    expect(
      inventoryStatus({
        sku: 'CASE-3',
        onHand: 5,
        reorderPoint: 5,
        reorderQuantity: 12,
      }),
    ).toBe('low_stock')
  })

  it('keeps zero inventory out of stock at a zero reorder point', () => {
    expect(
      inventoryStatus({
        sku: 'BIN-4',
        onHand: 0,
        reorderPoint: 0,
        reorderQuantity: 8,
      }),
    ).toBe('out_of_stock')
  })
})
