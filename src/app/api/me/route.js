import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Chayanin Suatap",
    studentId: "650610560",
  });
};
