import { AddressInterface } from "../address";
import { RouteInterface } from "../route";
import { SubscriptionPlanInterface } from "../subscription-plan";

export interface CustomerInterface {
    cmp_uuid: string | null,
    cus_uuid: string | null,
    cus_fullname: string | null,
    cus_email: string | null,
    cus_phone: string | null,
    cus_dateofbirth: Date | null,
    rou_uuid: string | null,
    rou: RouteInterface | null,
    pmt_uuid: string | null,
    usr_uuid: string | null,
    cus_subscriptionplanbycustomer: boolean | null,
    subp_uuid: string | null,
    subp?: SubscriptionPlanInterface | null,
    cus_createdat: Date | null,
    cus_updatedat: Date | null,
    addresses?: AddressInterface[]
}