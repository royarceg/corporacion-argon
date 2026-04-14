"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminClients from "@/components/admin/AdminClients";

export default function AdminPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ordenes");

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) router.replace("/login");
      else if (!isAdmin()) router.replace("/productos");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <div style={{ width: "100%", maxWidth: "1400px", flex: 1 }}>
        <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "ordenes" && <AdminOrders />}
          {activeTab === "usuarios" && <AdminUsers />}
          {activeTab === "productos" && <AdminProducts />}
          {activeTab === "clientes" && <AdminClients />}
        </AdminLayout>
      </div>
    </div>
  );
}
