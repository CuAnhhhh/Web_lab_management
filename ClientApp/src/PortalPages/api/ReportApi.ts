import axios from "axios";
import { Common } from "../model/CommonModel";
import { Reports } from "../model/ReportModel";
import { Student } from "../model/StudentModel";

const api = "http://26.243.146.110:7051";

export async function getMemberReportDetail(
  studentId: string
): Promise<Reports.ReportModelResponse> {
  const response = await axios.get(
    `${api}/report/getmemberreportdetail/${studentId}`
  );
  return response.data;
}

export async function getProjectReportDetail(
  projectId: string
): Promise<Reports.ReportModelResponse> {
  const response = await axios.get(
    `${api}/report/getprojectreportdetail/${projectId}`
  );
  return response.data;
}

export async function createReport(
  model: Reports.ReportListModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/report/createreport`, model);
  return response.data;
}

export async function getReportList(
  currentPage: number
): Promise<Student.StudentReportModelResponse> {
  const response = await axios.get(
    `${api}/report/getreportlist/${currentPage}`
  );
  return response.data;
}