import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "No se ha encontrado INSTAGRAM_ACCESS_TOKEN" },
        { status: 500 }
      );
    }

    const url =
      `https://graph.instagram.com/v23.0/me/media` +
      `?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp` +
      `&limit=12` +
      `&access_token=${encodeURIComponent(token)}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Error al consultar Instagram",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Instagram API error:", error);

    return NextResponse.json(
      { error: "Error interno al conectar con Instagram" },
      { status: 500 }
    );
  }
}
