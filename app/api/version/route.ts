import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "v3",
    design: "html-css-puro",
    commit: "3fc0100",
    template: "Playfair-Display-Lato",
    timestamp: new Date().toISOString(),
  });
}
