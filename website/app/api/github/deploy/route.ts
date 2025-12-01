import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_SERVER_URL } from "@/lib/config";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { owner, repo, ...config } = body ?? {};

    if (!owner || !repo) {
      return NextResponse.json(
        { message: "Missing owner or repo" },
        { status: 400 }
      );
    }

    const backendUrl = `${API_SERVER_URL}/api/github/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(repo)}/deploy-config`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Auth-Provider": "GITHUB",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        "Backend /api/github/repos/:owner/:repo/deploy-config error:",
        response.status,
        text
      );
      return NextResponse.json(
        { message: "Failed to save deployment configuration" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Error calling backend /api/github/repos/:owner/:repo/deploy-config:",
      error
    );
    return NextResponse.json(
      { message: "Error while saving deployment configuration" },
      { status: 500 }
    );
  }
}


