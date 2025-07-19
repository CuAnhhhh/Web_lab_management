import axios from "axios";
import { Project } from "../model/ProjectModel";
import { Common } from "../model/CommonModel";

const api = "http://26.243.146.110:7051";

export async function getProjectList(
  model: Project.GetProjectListModel
): Promise<Project.ProjectModelResponse> {
  const response = await axios.post(`${api}/project/getprojectlist`, model);
  return response.data;
}

export async function createProject(
  model: Project.ProjectCreateModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/project/createproject`, model);
  return response.data;
}

export async function deleteProject(
  model: Project.DeleteProjectModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/project/deleteproject`, model);
  return response.data;
}

export async function getProjectDetail(
  projectId: string
): Promise<Project.ProjectDetailModelResponse> {
  const response = await axios.get(
    `${api}/project/getprojectdetail/${projectId}`
  );
  return response.data;
}

export async function getProjectListName(
  state: number
): Promise<Project.ProjectModelResponse> {
  const response = await axios.get(`${api}/project/getprojectlistname/${state}`);
  return response.data;
}

export async function completeProject(
  model: Project.DeleteProjectModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/project/completeproject`, model);
  return response.data;
}