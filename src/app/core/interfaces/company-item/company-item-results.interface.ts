import { CompanyItemInterface } from "./company-item.interface";

export interface companyItemResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: CompanyItemInterface[]
}