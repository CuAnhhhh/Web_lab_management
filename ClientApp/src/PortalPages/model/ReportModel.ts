/* eslint-disable @typescript-eslint/no-namespace */
export namespace Reports {
  export interface ReportListModel {
    reportId?: string;
    projectId?: string;
    studentId?: string;
    comment?: string;
    studentReport?: string;
    reportedDate?: string;
    reportedWeek?: number;
    studentScore?: number;
  }

  export interface ReportModelResponse {
    reportList?: ReportListModel[];
    projectCreatedDate?: string;
    isLeader?: boolean;
    isDone?: boolean;
    error?: string;
  }

  export interface GetReportModel {
    studentId?: string;
    currentId?: string;
  }
}
