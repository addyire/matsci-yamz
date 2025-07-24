import { OAuthURL } from "@/lib/apis/google"
import { NextResponse } from "next/server"


export const GET = async () => {
  return NextResponse.redirect(OAuthURL)
}
