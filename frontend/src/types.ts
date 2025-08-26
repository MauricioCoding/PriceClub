export type Product = {
  id: number;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  created_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
