import { Student } from "./StudentModel";
/* eslint-disable @typescript-eslint/no-namespace */
export namespace Project {
  export interface ProjectListModel {
    projectId?: string;
    projectName?: string;
    description?: string;
    projectTypeId?: string;
    collaboration?: boolean;
    totalMember?: number;
    isActive?: boolean;
    reason?: string;
    leadBy?: string;
    createdBy?: string;
    createdDate?: string;
    removedBy?: string;
    removedDate?: string;
  }

  export interface ProjectCreateModel extends ProjectListModel {
    memberList?: Student.StudentIdModel[];
  }

  export interface ProjectModelResponse {
    projectList?: ProjectListModel[];
    isDone?: boolean;
    total?: number;
    error?: string;
  }

  export interface DeleteProjectModel {
    projectId?: string;
    removedBy?: string;
    removedDate?: string;
    reason?: string;
  }

  export interface ProjectDetailModel extends ProjectListModel {
    isWeeklyReport?: boolean;
    projectTypeName?: string;
    relationshipList?: Student.RelationshipStudentModel[];
  }

  export interface ProjectDetailModelResponse {
    projectDetail?: ProjectDetailModel;
    isDone?: boolean;
    error?: string;
  }

  export interface GetProjectListModel {
    currentPage?: number;
    searchValue?: string;
    state?: boolean;
  }
}
