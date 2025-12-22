import { SubscriptionPlanInterface } from "./subscription-plan.interface";

export interface SubscriptionPlanResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: SubscriptionPlanInterface[]
}