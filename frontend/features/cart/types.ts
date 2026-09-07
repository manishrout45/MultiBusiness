export interface CartItem {
  id: string;
  productId: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
  variationId?: string | null;
  variationLabel?: string | null;
}

export interface CartTotals {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  itemCount: number;
}
