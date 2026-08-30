export interface CartItem {
  id: string;
  productId: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  total: number;
  itemCount: number;
}
