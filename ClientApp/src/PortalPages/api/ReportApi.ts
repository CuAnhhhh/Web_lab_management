import axios from "axios";
import { Common } from "../model/CommonModel";
import { Reports } from "../model/ReportModel";

const api = "https://localhost:7051";

export async function getReportDetail(
  model: Reports.GetReportModel
): Promise<Reports.ReportModelResponse> {
  const response = await axios.post(`${api}/report/getreportdetail`, model);
  return response.data;
}

export async function createReport(
    model: Reports.ReportListModel
  ): Promise<Common.ResponseModel> {
    const response = await axios.post(`${api}/report/createreport`, model);
    return response.data;
  }