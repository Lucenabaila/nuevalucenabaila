export function esAdministrador(request) {
  const cookie = request.cookies.get("admin_session");

  return cookie?.value === "authenticated";
}
