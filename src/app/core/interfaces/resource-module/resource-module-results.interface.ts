import { ResourceModuleInterface } from "./resource-module.interface";

export interface ResourceModuleResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: ResourceModuleInterface[]
}