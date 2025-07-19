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
    isProjectReport?: boolean;
  }

  export interface ReportModelResponse {
    reportList?: MemberReportModel[];
    projectCreatedDate?: string;
    isWeeklyReport?: boolean;
    isMultiProject?: boolean;
    isDone?: boolean;
    error?: string;
  }

  export interface MemberListModel {
    studentId?: string;
    studentName?: string;
  }

  export interface MemberReportModel extends ReportListModel {
    studentName?: string;
    memberReportList?: MemberReportModel[];
  }
}
