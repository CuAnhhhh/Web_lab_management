/* eslint-disable @typescript-eslint/no-namespace */
export namespace Common {
  export interface ResponseModel {
    id?: string;
    isDone?: boolean;
    error?: string;
    errorCode?: number;
  }

  export interface StudentLoginModel {
    userName?: string;
    passWord?: string;
  }

  export interface StudentLoginResponseModel {
    studentId?: string;
    studentRole?: string;
    projectId?: string;
    isLeader?: string;
    collaboration?: boolean;
    isCorrect?: string;
  }
}
