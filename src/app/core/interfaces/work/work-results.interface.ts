import { WorkInterface } from "./work.interface";

export interface WorkResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: WorkInterface[]
}