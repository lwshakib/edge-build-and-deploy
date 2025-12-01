import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_SERVER_URL } from "@/lib/config";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Not authenticated", repos: [] },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${API_SERVER_URL}/api/github/repos`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Auth-Provider": "GITHUB",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Backend /api/github/repos error:", response.status, text);
      return NextResponse.json(
        { message: "Failed to load GitHub repositories", repos: [] },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error calling backend /api/github/repos:", error);
    return NextResponse.json(
      { message: "Error while loading GitHub repositories", repos: [] },
      { status: 500 }
    );
  }
}
