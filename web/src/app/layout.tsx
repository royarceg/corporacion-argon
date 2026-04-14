import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ShoppingBagDrawer from "@/components/cart/ShoppingBagDrawer";

export const metadata: Metadata = {
  title: "Corporación ARGON | Equipamiento Profesional",
  description:
    "Uniformes tácticos, botas de seguridad y equipamiento profesional. Calidad que resiste cualquier condición.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <ShoppingBagDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
