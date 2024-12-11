import axios from "axios";
import { Common } from "../model/CommonModel";
import { Template } from "../model/TemplateModel";

const api = "https://localhost:7051";

export async function getTemplateList(): Promise<Template.TemplateModelResponse> {
  const response = await axios.get(`${api}/template/gettemplatelist`);
  return response.data;
}

export async function deleteTemplate(
  templateId: string
): Promise<Common.ResponseModel> {
  const response = await axios.get(
    `${api}/template/deletetemplate/${templateId}`
  );
  return response.data;
}

export async function createTemplate(
  model: Template.TemplateListModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/template/createtemplate`, model);
  return response.data;
}
