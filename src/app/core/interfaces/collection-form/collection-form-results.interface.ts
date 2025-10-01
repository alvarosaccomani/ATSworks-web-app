import { CollectionFormInterface } from "./collection-form.interface";

export interface CollectionFormResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: CollectionFormInterface[]
}