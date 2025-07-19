/* eslint-disable @typescript-eslint/no-namespace */
export namespace Template {
  export interface TemplateListModel {
    templateId?: string;
    templateName?: string;
    description?: string;
    projectId?: string;
    createdDate?: string;
    createdBy?: string;
    createdByName?: string;
  }

  export interface TemplateModelResponse {
    templateList?: TemplateListModel[];
    total?: number;
    isDone?: boolean;
    error?: string;
  }

  export interface GetTemplateListModel {
    currentPage?: number;
    projectId?: string;
  }
}
