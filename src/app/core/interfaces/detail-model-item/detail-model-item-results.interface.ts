import { DetailModelItemInterface } from "./detail-model-item.interface";

export interface DetailModelItemResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: DetailModelItemInterface[]
}