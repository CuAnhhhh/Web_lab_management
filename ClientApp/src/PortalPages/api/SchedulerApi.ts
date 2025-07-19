import axios from "axios";
import { Scheduler } from "../model/SchedulerModel";
import { Common } from "../model/CommonModel";

const api = "http://26.243.146.110:7051";

export async function getSchedulers(
  studentId: string
): Promise<Scheduler.SchedulerModelResponse> {
  const response = await axios.get(
    `${api}/scheduler/getschedulers/${studentId}`
  );
  return response.data;
}

export async function createScheduler(
  model: Scheduler.SchedulerModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/scheduler/createscheduler`, model);
  return response.data;
}

export async function deleteScheduler(
  model: Scheduler.SchedulerModel
): Promise<Common.ResponseModel> {
  const response = await axios.post(`${api}/scheduler/deletescheduler`, model);
  return response.data;
}