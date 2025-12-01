import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_SERVER_URL } from "@/lib/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const owner = url.searchParams.get("owner");
  const repo = url.searchParams.get("repo");
  const path = url.searchParams.get("path") ?? "";

  if (!owner || !repo) {
    return NextResponse.json(
      { message: "Missing owner or repo", directories: [] },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Not authenticated", directories: [] },
      { status: 401 }
    );
  }

  try {
    const backendUrl = new URL(
      `${API_SERVER_URL}/api/github/repos/${encodeURIComponent(
        owner
      )}/${encodeURIComponent(repo)}/dirs`
    );
    if (path) {
      backendUrl.searchParams.set("path", path);
    }

    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Auth-Provider": "GITHUB",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Backend /api/github/dirs error:", response.status, text);
      return NextResponse.json(
        { message: "Failed to load GitHub directories", directories: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error calling backend /api/github/dirs:", error);
    return NextResponse.json(
      { message: "Error while loading GitHub directories", directories: [] },
      { status: 500 }
    );
  }
}


