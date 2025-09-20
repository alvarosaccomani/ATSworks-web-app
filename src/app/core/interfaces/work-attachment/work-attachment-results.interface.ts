import { WorkAttachmentInterface } from "./work-attachment.interface";

export interface WorkAttachmentResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: WorkAttachmentInterface[]
}