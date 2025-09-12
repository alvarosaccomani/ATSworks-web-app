import { WorkDetailInterface } from "./work-detail.interface";

export interface WorkDetailResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: WorkDetailInterface[]
}