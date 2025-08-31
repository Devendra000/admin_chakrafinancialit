"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminCatchAll() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/login?mustLogin=true");
      return;
    }
    fetch("/api/verify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          localStorage.removeItem("admin_token");
          router.replace("/login?mustLogin=true");
        }
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        router.replace("/login?mustLogin=true");
      });
  }, [router]);

  // If authenticated, show not found message
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-6">404 - Not Found</h2>
        <p className="mb-4">The page you are looking for does not exist.</p>
        <p className="text-sm text-gray-500">If you believe this is an error, please contact the administrator.</p>
      </div>
    </div>
  );
}
