import { GroupDetailModelItemInterface } from "./group-detail-model-item.interface";

export interface GroupDetailModelItemResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: GroupDetailModelItemInterface[]
}