import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useRequireAuth(redirectTo = "/login") {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated()) router.replace(redirectTo);
  }, [auth.loading, auth.isAuthenticated, router, redirectTo]);

  return auth;
}
