import { DataTypeInterface } from "./data-type.interface";

export interface DataTypeResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: DataTypeInterface[]
}