import { PaymentMethodInterface } from "./payment-method.interface";

export interface PaymentMethodResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: PaymentMethodInterface[]
}