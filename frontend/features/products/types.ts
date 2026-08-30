export interface ProductVariation {
  id: string;
  name: string;
  value: string;
  priceAdjustment: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  category: string;
  categorySlug: string;
  stock: number;
  variations: ProductVariation[];
  vendorId: string;
  status: 'draft' | 'pending' | 'published' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'vendorId'> & {
  vendorId?: string;
};
