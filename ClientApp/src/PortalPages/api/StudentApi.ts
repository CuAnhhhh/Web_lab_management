import axios from "axios";
import { Student } from "../model/StudentModel";
import { Common } from "../model/CommonModel";

const api = "https://localhost:7051";

export async function getStudentList(
  status: string
): Promise<Student.StudentListModelResponse> {
  const response = await axios.get(`${api}/student/getstudentlist/${status}`);
  return response.data;
}

export async function getMemberList(
  studentId: string
): Promise<Student.StudentListModelResponse> {
  const response = await axios.get(`${api}/student/getmemberlist/${studentId}`);
  return response.data;
}

export async function getStudentIdList(): Promise<Student.StudentIdModelResponse> {
  const response = await axios.get(`${api}/student/getstudentidlist`);
  return response.data;
}

export async function deleteStudent(
  studentId: string
): Promise<Common.ResponseModel> {
  const response = await axios.get(`${api}/student/deletestudent/${studentId}`);
  return response.data;
}

export async function createStudent(
  model: Student.StudentListModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/student/createstudent`, model);
  return response.data;
}

export async function addStudent(
  model: Student.RelationshipStudentModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/student/addstudent`, model);
  return response.data;
}

export async function removeStudent(
  model: Student.RelationshipStudentModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/student/removestudent`, model);
  return response.data;
}

export async function StudentLogin(
  model: Common.StudentLoginModel
): Promise<Common.StudentLoginResponseModel> {
  const response = await axios.post(`${api}/student/studentlogin`, model);
  return response.data;
}

export async function getStudentDetail(
  studentId: string
): Promise<Student.StudentDetailModelResponse> {
  const response = await axios.get(
    `${api}/student/getstudentdetail/${studentId}`
  );
  return response.data;
}

export async function getStudentDetailEdit(
  studentId: string
): Promise<Student.StudentDetailEditModelResponse> {
  const response = await axios.get(
    `${api}/student/getstudentdetailedit/${studentId}`
  );
  return response.data;
}
