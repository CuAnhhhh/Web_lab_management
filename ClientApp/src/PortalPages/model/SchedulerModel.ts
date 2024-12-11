/* eslint-disable @typescript-eslint/no-namespace */
export namespace Scheduler {
  export interface SchedulerModel {
    schedulerId?: string;
    eventType?: number;
    startDate?: string;
    endDate?: string;
    description?: string;
    projectId?: string;
    createdBy?: string;
  }

  export interface SchedulerModelResponse {
    schedulerList?: SchedulerModel[];
    projectId?: string;
    isLeader?: boolean;
    isDone?: boolean;
    error?: string;
  }
}
