import { server_base_url } from "@/constant/server-constants";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";

  try {
    const res = await fetch(`${server_base_url}/users/me`, { // Fixed: should be /users/me not /users
      method: "GET",
      headers: { 
        Cookie: cookie,
        "Content-Type": "application/json"
      },
      credentials: "include",
      cache: "no-store",
    });

    
    // Get the raw text first to see what's actually returned
    const rawText = await res.text();
    
    if (!res.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    try {
      const data = JSON.parse(rawText);
      
      if (data.success && data.data) {
        return NextResponse.json({ user: data.data });
      } else {
        return NextResponse.json({ user: null }, { status: 401 });
      }
    } catch (parseError) {
      return NextResponse.json({ user: null }, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}