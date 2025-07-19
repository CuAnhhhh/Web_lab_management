import axios from "axios";
import { Common } from "../model/CommonModel";
import { Template } from "../model/TemplateModel";

const api = "http://26.243.146.110:7051";

export async function getTemplateList(
  model: Template.GetTemplateListModel
): Promise<Template.TemplateModelResponse> {
  const response = await axios.post(`${api}/template/gettemplatelist`, model);
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
