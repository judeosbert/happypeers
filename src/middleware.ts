import { NextRequest, NextResponse } from "next/server";

export async function middleware (req:NextRequest){
    const t = req.headers.get("auth-token")
    // if(!t){
    //     return NextResponse.error()
    // }
    return NextResponse.next()
}

export const config = {
    matcher: ['/api/:path*']
};



