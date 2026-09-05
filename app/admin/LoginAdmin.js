"use client";

import { useState } from "react";

export default function LoginAdmin({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function iniciarSesion(event) {
    event.preventDefault();

    setError("");

    if (!usuario.trim() || !password) {
      setError("Introduce el usuario y la contraseña.");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await fetch(
        "/api/admin-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario: usuario.trim(),
            password,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        setError(
          datos.mensaje ||
          "Usuario o contraseña incorrectos."
        );
        return;
      }

      onLogin();

    } catch (error) {
      console.error(
        "Error iniciando sesión:",
        error
      );

      setError(
        "No se pudo iniciar sesión. Inténtalo de nuevo."
      );

    } finally {
      setCargando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #24101f 0%, #080808 45%, #000000 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "rgba(18,18,18,0.96)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "36px",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55)",
        }}
      >

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >

          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 18px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, #ff2f92, #ff5b9f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "900",
              letterSpacing: "1px",
            }}
          >
            LB
          </div>

          <div
            style={{
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "3px",
              color: "#ff5b9f",
              marginBottom: "8px",
            }}
          >
            ARTES ESCÉNICAS PARADISE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "800",
            }}
          >
            Administración
          </h1>

          <p
            style={{
              margin:
                "10px 0 0",
              color:
                "rgba(255,255,255,0.58)",
              fontSize: "14px",
            }}
          >
            Acceso exclusivo para administradores
          </p>

        </div>


        <form onSubmit={iniciarSesion}>

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            Usuario
          </label>

          <input
            type="text"
            value={usuario}
            onChange={(event) =>
              setUsuario(event.target.value)
            }
            placeholder="Introduce tu usuario"
            autoComplete="username"
            disabled={cargando}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: "12px",
              border:
                "1px solid rgba(255,255,255,0.12)",
              background:
                "rgba(255,255,255,0.05)",
              color: "#ffffff",
              outline: "none",
              marginBottom: "18px",
              fontSize: "15px",
            }}
          />


          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            Contraseña
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Introduce tu contraseña"
            autoComplete="current-password"
            disabled={cargando}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: "12px",
              border:
                "1px solid rgba(255,255,255,0.12)",
              background:
                "rgba(255,255,255,0.05)",
              color: "#ffffff",
              outline: "none",
              marginBottom: "18px",
              fontSize: "15px",
            }}
          />


          {error && (

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                background:
                  "rgba(255,70,100,0.10)",
                border:
                  "1px solid rgba(255,70,100,0.25)",
                color: "#ff9aa5",
                fontSize: "13px",
                marginBottom: "18px",
              }}
            >
              {error}
            </div>

          )}


          <button
            type="submit"
            disabled={cargando}
            style={{
              width: "100%",
              border: 0,
              borderRadius: "12px",
              padding: "15px",
              background:
                "linear-gradient(135deg, #ff2f92, #ff5b9f)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "800",
              cursor: cargando
                ? "default"
                : "pointer",
              opacity: cargando
                ? 0.7
                : 1,
            }}
          >
            {cargando
              ? "Comprobando..."
              : "Entrar al administrador"}
          </button>

        </form>

      </div>
    </main>
  );
}
