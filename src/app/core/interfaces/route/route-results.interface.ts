import { RouteInterface } from "./route.interface";

export interface RouteResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: RouteInterface[]
}