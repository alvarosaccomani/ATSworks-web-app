import { WorkHistoryInterface } from "./work-history.interface";

export interface WorkHistoryResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: WorkHistoryInterface[];
}
