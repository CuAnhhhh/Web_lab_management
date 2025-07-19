/* eslint-disable @typescript-eslint/no-namespace */
export namespace Scheduler {
  export interface SchedulerModel {
    schedulerId?: string;
    eventType?: number;
    startDate?: string;
    endDate?: string;
    description?: string;
    projectId?: string;
    projectName?: string;
    createdBy?: string;
    createdByName?: string;
  }

  export interface SchedulerModelResponse {
    schedulerList?: SchedulerModel[];
    isDone?: boolean;
    error?: string;
  }
}
