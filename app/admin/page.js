"use client";

import { useEffect, useState } from "react";
import LoginAdmin from "./LoginAdmin";
import AdminPanel from "./AdminPanel";

export default function AdminPage() {
  const [comprobandoSesion, setComprobandoSesion] =
    useState(true);

  const [autenticado, setAutenticado] =
    useState(false);

  useEffect(() => {
    comprobarSesion();
  }, []);

  async function comprobarSesion() {
    try {
      const respuesta = await fetch(
        "/api/admin-session",
        {
          cache: "no-store",
        }
      );

      const datos = await respuesta.json();

      setAutenticado(
        datos.autenticado === true
      );

    } catch (error) {
      console.error(
        "Error comprobando sesión:",
        error
      );

      setAutenticado(false);

    } finally {
      setComprobandoSesion(false);
    }
  }

  function accesoCorrecto() {
    setAutenticado(true);
  }

  if (comprobandoSesion) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080808",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Comprobando acceso...
      </div>
    );
  }

  if (!autenticado) {
    return (
      <LoginAdmin
        onLogin={accesoCorrecto}
      />
    );
  }

  return <AdminPanel />;
}
