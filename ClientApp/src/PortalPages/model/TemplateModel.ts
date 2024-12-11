/* eslint-disable @typescript-eslint/no-namespace */
export namespace Template {
  export interface TemplateListModel {
    templateId?: string;
    templateName?: string;
    description?: string;
    createdDate?: string;
    createdBy?: string;
  }

  export interface TemplateModelResponse {
    templateList?: TemplateListModel[];
    total?: number;
    isDone?: boolean;
    error?: string;
  }
}
