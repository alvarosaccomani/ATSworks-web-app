import { PermissionInterface } from "./permission.interface";

export interface PermissionResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: PermissionInterface[]
}