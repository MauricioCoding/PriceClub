// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthProvider from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";


import ProductsPage from "./pages/Products";
import CartPage from "./pages/Cart";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/SignupForm";
import HomePage from "./pages/Home";
//import type { JSX } from "react";

/*function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}*/

export default function App() {
  return (
    <AuthProvider>
      <CartProvider> 
      <div
        className="d-flex flex-column min-vh-100"
        style={{ paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}
      >
        <Header title="Price Club"/>

        <main className="flex-grow-1 container-fluid px-3 py-3">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
      </CartProvider> 
    </AuthProvider>
  );
}
