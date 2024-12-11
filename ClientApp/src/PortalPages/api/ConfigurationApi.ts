import axios from "axios";
import { Configuration } from "../model/ConfigurationModel";
import { Common } from "../model/CommonModel";

const api = "https://localhost:7051";

export async function getStudentRoleList(): Promise<Configuration.StudentRoleResponseModel> {
  const response = await axios.get(`${api}/configuration/getstudentrolelist`);
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

export async function getProjectTypeList(): Promise<Configuration.ProjectTypeResponseModel> {
  const response = await axios.get(`${api}/configuration/getprojecttypelist`);
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
