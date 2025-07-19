/* eslint-disable @typescript-eslint/no-namespace */
export namespace Configuration {
  export interface ProjectTypeListModel {
    projectTypeId?: string;
    projectTypeName?: string;
    description?: string;
    isWeeklyReport?: boolean;
    createdBy?: string;
    createdDate?: string;
  }

  export interface ProjectTypeResponseModel {
    projectTypeList?: ProjectTypeListModel[];
    total?: number;
    isDone?: boolean;
    error?: string;
  }

  export interface StudentRoleListModel {
    studentRoleId?: string;
    studentRoleName?: string;
    description?: string;
    createdBy?: string;
    createdDate?: string;
  }

  export interface StudentRoleResponseModel {
    studentRoleList?: StudentRoleListModel[];
    total?: number;
    isDone?: boolean;
    error?: string;
  }
}
