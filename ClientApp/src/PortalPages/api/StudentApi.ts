import axios from "axios";
import { Student } from "../model/StudentModel";
import { Common } from "../model/CommonModel";

const api = "http://26.243.146.110:7051";

export async function getStudentList(
  model: Student.GetStudentListModel
): Promise<Student.StudentListModelResponse> {
  const response = await axios.post(`${api}/student/getstudentlist`, model);
  return response.data;
}

export async function getMemberList(
  model: Student.GetMemberModel
): Promise<Student.StudentReportModelResponse> {
  const response = await axios.post(`${api}/student/getmemberlist`, model);
  return response.data;
}

export async function getStudentIdList(): Promise<Student.StudentIdModelResponse> {
  const response = await axios.get(`${api}/student/getstudentidlist`);
  return response.data;
}

export async function getStudentChatList(
  studentId: string
): Promise<Student.StudentIdModelResponse> {
  const response = await axios.get(
    `${api}/student/getstudentchatlist/${studentId}`
  );
  return response.data;
}

export async function deleteStudent(
  model: Student.DeleteStudentModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/student/deletestudent`, model);
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
