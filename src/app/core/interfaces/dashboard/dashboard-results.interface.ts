import { DashboardInterface } from "./dashboard.interface";

export interface DashboardResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: DashboardInterface[]
}