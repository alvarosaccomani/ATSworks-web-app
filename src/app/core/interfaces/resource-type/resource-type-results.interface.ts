import { ResourceTypeInterface } from "./resource-type.interface";

export interface ResourceTypeResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: ResourceTypeInterface[]
}