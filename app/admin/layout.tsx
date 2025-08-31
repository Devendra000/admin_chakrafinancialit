
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState<null | boolean>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      // Store intended route for post-login redirect
      if (window && window.location) {
        localStorage.setItem("intended_route", window.location.pathname);
      }
      router.replace("/login?mustLogin=true");
      setVerified(false);
      return;
    }
    fetch("/api/verify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setVerified(true);
        } else {
          localStorage.removeItem("admin_token");
          if (window && window.location) {
            localStorage.setItem("intended_route", window.location.pathname);
          }
          router.replace("/login?mustLogin=true");
          setVerified(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        if (window && window.location) {
          localStorage.setItem("intended_route", window.location.pathname);
        }
        router.replace("/login?mustLogin=true");
        setVerified(false);
      });
  }, [router]);

  if (verified !== true) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">{children}</div>
    </div>
  );
}
