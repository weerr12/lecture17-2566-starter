import { DB } from "@/app/libs/DB";
import { zEnrollmentGetParam, zEnrollmentPostBody } from "@/app/libs/schema";
import { NextResponse } from "next/server";
// enroll เอาไว้ดูวิชาที่ได้ลงทะเบียนไปแล้ว

export const GET = async (request) => {
  // get studentId มาก่อน
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
  //1. ประกาศ courseNumberList เป็น array ว่างเปล่า
  const courseNoList = [];
  // วน loop ในข้อมูล enrollments ใน DB.js
  // enroll ที่วนแต่ละ รอบ จะมีหน้าตาอย่างนี้ = {studentId: string, courseNo: string}
  for (const enroll of DB.enrollments) {
    //enroll = {studentId: string, courseNo: string}
    // เช็คที่วนแต่ละรอบเป็น studentId ที่ต้องการหรือเปล่า
    if (enroll.studentId === studentId) {
      // ถ้าเป็น Id ที่ต้องการ add เข้าไป
      courseNoList.push(enroll.courseNo);
    }
  }
  // ผลลัพธ์ จะได้
  // {
  //   "ok": true,
  //   "courseNoList": [
  //     "261207",
  //     "001101"
  //   ]
  // }

  // ประกาศ course เป็น array ว่างเปล่า
  const courses = [];
  // วน loop courseNoList จาก step 1
  for (const courseNo of courseNoList) {
    /* (foound) course = {
      courseNo: "001101",
      title: " FUNDAMENTAL ENGLISH 1",
      (!found) course = undefined 
    } */
    //2. ดึง DB.courses มาดูว่า มี couseNo ไหนบ้างที่ match กัน
    // ประกาศตัวแปร couse ขึ้นมา
    const course = DB.courses.find((x) => x.courseNo === courseNo);
    // ดัก กรณีข้อมูล ใน DB.enrollments มี แต่ใน DB.courses ไม่มี
    if (!course)
      // return error
      return NextResponse.json(
        {
          ok: false,
          message: "Oops! please try again later",
        },
        { status: 500 }
      );
    // ถ้าเจอ ก็ให้ add course ที่กำลัง วน loop อยู่เข้าไป
    // ถ้า match (ใน DB.enrollments มี และใน DB.courses ก็มี) เอาก้อนทั้งก้อน add เข้าไป
    courses.push(course);
  }

  return NextResponse.json({
    ok: true,
    // courses:courses ,
    // courseNoList, อยู่ใน step 1
    courses,
  });
  // ผลลัพธ์
  // {
  //   "ok": true,
  //   "courses": [
  //     {
  //       "courseNo": "261207",
  //       "title": "BASIC COMP ENGR LAB"
  //     }
  //   ]
  // }
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
  // validate ผ่านแล้ว แกะ studentId, courseNo ออกมาจาก body
  const { studentId, courseNo } = body;
  // มี 3 เงื่อนไขต้องเช็คก่อนที่จะเพิ่มข้อมูล
  // 1 ต้องเช็คว่า Id นั้นมีตัวตนใน DB จริงๆหรือเปล่า เป็นการหา->find
  const foundStudent = DB.students.find((x) => x.studentId === studentId);
  // 2 รหัสวิชา มีใน DB จริงๆหรือเปล่า เป็นการหา->find
  const foundCourse = DB.courses.find((x) => x.courseNo === courseNo);
  // ค้าหาเสร็จเอาตัวแปรเหล่านั้นมาใช้
  // ดักกรณีหา นักเรียนไม่เจอ หรือ หาวิชาไม่เจอ
  if (!foundStudent || !foundCourse)
    // return error
    return NextResponse.json(
      {
        ok: false,
        message: "Student Id or Course No is not existed",
      },
      { status: 400 }
    );
  // 3 เช็คก่อนว่า นักเรียนคนนั้นเคยลงทะเบียนวิชานั้นไปยัง ห้ามซ้ำ เป็นการหา->find
  const foundEnroll = DB.enrollments.find(
    (x) => x.studentId === studentId && x.courseNo === courseNo
  );
  // ดักกรณีหาเจอว่าซ้ำกัน
  // เขียนอีกแบบก็ได้ if(foundEnroll != undefind)
  if (foundEnroll)
    // return error
    return NextResponse.json(
      {
        ok: false,
        message: "Student already enrolled that course",
      },
      { status: 400 }
    );

  //save in db
  // step สุดท้ายคือ add ข้อมูลจริงๆ ลงใน DB.enrollments
  DB.enrollments.push({
    studentId,
    courseNo,
  });

  return NextResponse.json({
    ok: true,
    message: "Student has enrolled course",
  });
};
