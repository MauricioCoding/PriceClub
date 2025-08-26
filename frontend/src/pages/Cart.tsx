import CartComponent from "../components/Cart";

export default function CartPage() {
  return (
    <div className="container py-4">
      <h1 className="mb-4">Your Shopping Cart</h1>
      <CartComponent />
    </div>
  );
}