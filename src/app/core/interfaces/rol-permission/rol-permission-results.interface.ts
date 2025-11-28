import { RolPermissionInterface } from "./rol-permission.interface";

export interface RolPermissionResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: RolPermissionInterface[]
}