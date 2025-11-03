import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import axiosClient from "@/lib/axiosClient";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signup(data: { email: string; password: string; displayName?: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.post("/auth/signup", data);
      return { success: true, data: res.data?.data };
    } catch (err: any) {
      const message = err.message || "Signup failed";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) throw new Error(res.error);
      return { success: true };
    } catch (err: any) {
      const message = err.message || "Signup failed";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut({ redirect: true, callbackUrl: "/" });
  }
  return { signup, login, logout, loading, error };
}
