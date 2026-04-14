export interface Product {
  code: string;
  name: string;
  description: string;
  observations: string | null;
  unit: string;
  codeBase: string;
  color: string | null;
  category: string;
  subcategory: string;
  images: string[];
  sizes: string[];
  badge?: "new" | "exclusive";
}

export interface Category {
  slug: string;
  title: string;
  titleEn: string;
  illustration: string;
  productCount: number;
  products: Product[];
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}
