import axios from "axios";
import { Configuration } from "../model/ConfigurationModel";
import { Common } from "../model/CommonModel";

const api = "http://26.243.146.110:7051";

export async function getStudentRoleList(
  currentPage: number
): Promise<Configuration.StudentRoleResponseModel> {
  const response = await axios.get(
    `${api}/configuration/getstudentrolelist/${currentPage}`
  );
  return response.data;
}

export async function getStudentRoleIdList(): Promise<Configuration.StudentRoleResponseModel> {
  const response = await axios.get(`${api}/configuration/getstudentroleidlist`);
  return response.data;
}

export async function createStudentRole(
  model: Configuration.StudentRoleListModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(
    `${api}/configuration/createstudentrole`,
    model
  );
  return response.data;
}

export async function deleteStudentRole(
  id: string
): Promise<Common.ResponseModel> {
  const response = await axios.get(
    `${api}/configuration/deletestudentrole/${id}`
  );
  return response.data;
}

export async function getProjectTypeList(
  currentPage: number
): Promise<Configuration.ProjectTypeResponseModel> {
  const response = await axios.get(
    `${api}/configuration/getprojecttypelist/${currentPage}`
  );
  return response.data;
}

export async function getProjectTypeIdList(
  status?: boolean
): Promise<Configuration.ProjectTypeResponseModel> {
  const response = await axios.get(
    `${api}/configuration/getprojecttypeidlist/${status ?? "0"}`
  );
  return response.data;
}

export async function createProjectType(
  model: Configuration.ProjectTypeListModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(
    `${api}/configuration/createprojecttype`,
    model
  );
  return response.data;
}

export async function deleteProjectType(
  id: string
): Promise<Common.ResponseModel> {
  const response = await axios.get(
    `${api}/configuration/deleteprojecttype/${id}`
  );
  return response.data;
}
