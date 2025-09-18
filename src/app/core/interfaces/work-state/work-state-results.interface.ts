import { WorkStateInterface } from "./work-state.interface";

export interface WorkStateResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: WorkStateInterface[]
}