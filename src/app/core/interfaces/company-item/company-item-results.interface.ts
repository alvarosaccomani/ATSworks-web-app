import { CompanyItemInterface } from "./company-item.interface";

export interface CompanyItemResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: CompanyItemInterface[]
}