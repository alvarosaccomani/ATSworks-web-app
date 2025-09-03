import { ModelItemInterface } from "./model-item.interface";

export interface ModelItemResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: ModelItemInterface[]
}