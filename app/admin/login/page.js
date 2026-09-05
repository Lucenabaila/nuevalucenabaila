"use client";

import { useRouter } from "next/navigation";
import LoginAdmin from "../LoginAdmin";

export default function LoginPage() {
  const router = useRouter();

  function accesoCorrecto() {
    router.replace("/admin");
  }

  return (
    <LoginAdmin
      onLogin={accesoCorrecto}
    />
  );
}
