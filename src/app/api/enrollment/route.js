import { zEnrollmentGetParam, zEnrollmentPostBody } from "@/app/libs/schema";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const studentId = request.nextUrl.searchParams.get("studentId");

  //validate input
  const parseResult = zEnrollmentGetParam.safeParse({
    studentId,
  });
  if (parseResult.success === false) {
    return NextResponse.json(
      {
        ok: false,
        message: parseResult.error.issues[0].message,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
  });
};

export const POST = async (request) => {
  const body = await request.json();
  const parseResult = zEnrollmentPostBody.safeParse(body);
  if (parseResult.success === false) {
    return NextResponse.json(
      {
        ok: false,
        message: parseResult.error.issues[0].message,
      },
      { status: 400 }
    );
  }

  const { studentId, courseNo } = body;

  // return NextResponse.json(
  //   {
  //     ok: false,
  //     message: "Student Id or Course No is not existed",
  //   },
  //   { status: 400 }
  // );

  // return NextResponse.json(
  //   {
  //     ok: false,
  //     message: "Student already enrolled that course",
  //   },
  //   { status: 400 }
  // );

  //save in db

  return NextResponse.json({
    ok: true,
    message: "Student has enrolled course",
  });
};
