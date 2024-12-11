/* eslint-disable @typescript-eslint/no-namespace */
export namespace Student {
  export interface StudentListModel {
    studentId?: string;
    hustId?: number;
    studentName?: string;
    email?: string;
    address?: string;
    phoneNumber?: string;
    nationality?: number;
    gender?: boolean;
    studentRole?: string;
    status?: number;
    inProject?: boolean;
    createdDate?: string;
    createdBy?: string;
    removedDate?: string;
    removedBy?: string;
  }

  export interface StudentDetailModel extends StudentListModel {
    projectHistory?: ProjectHistoryModel[];
  }

  export interface ProjectHistoryModel {
    projectName?: string;
    onGoing?: boolean;
    createdDate?: string;
    createdBy?: string;
    removedDate?: string;
    removedBy?: string;
    isLeader?: boolean;
    status?: number;
  }

  export interface StudentDetailModelResponse {
    studentDetail?: StudentDetailModel;
    isDone?: boolean;
    error?: string;
  }

  export interface StudentDetailEditModelResponse {
    studentDetail?: StudentListModel;
    isDone?: boolean;
    error?: string;
  }

  export interface StudentListModelResponse {
    studentList?: StudentListModel[];
    total?: number;
    isDone?: boolean;
    error?: string;
    projectId?: string;
    isLeader?: boolean;
  }

  export interface StudentIdModel {
    studentId?: string;
    studentName?: string;
  }

  export interface StudentIdModelResponse {
    studentList?: StudentIdModel[];
    total?: number;
    isDone?: boolean;
    error?: string;
  }

  export interface RelationshipStudentModel {
    relationshipId?: string;
    studentId?: string;
    projectId?: string;
    isLeader?: boolean;
    createdDate?: string;
    createdBy?: string;
  }
}
