export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface InventoryItem {
  sku: string
  onHand: number
  reorderPoint: number
  reorderQuantity: number
}

export function inventoryStatus(item: InventoryItem): InventoryStatus {
  if (item.onHand <= 0) return 'out_of_stock'
  if (item.onHand <= item.reorderPoint) return 'low_stock'
  return 'in_stock'
}

export function reorderSuggestion(item: InventoryItem): number {
  return inventoryStatus(item) === 'low_stock' ? item.reorderQuantity : 0
}

export function summarizeInventory(items: readonly InventoryItem[]): {
  totalSkus: number
  lowStockSkus: string[]
  outOfStockSkus: string[]
} {
  return {
    totalSkus: items.length,
    lowStockSkus: items
      .filter((item) => inventoryStatus(item) === 'low_stock')
      .map((item) => item.sku),
    outOfStockSkus: items
      .filter((item) => inventoryStatus(item) === 'out_of_stock')
      .map((item) => item.sku),
  }
}
