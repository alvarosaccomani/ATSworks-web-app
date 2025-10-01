import { AddressInterface } from "../address";

export interface CustomerInterface {
    cmp_uuid: string | null,
    cus_uuid: string | null,
    cus_fullname: string | null,
    cus_email: string | null,
    cus_phone: string | null,    
    cfrm_uuid: string | null,
    usr_uuid: string | null,
    cus_createdat: Date | null,
    cus_updatedat: Date | null,
    addresses?: AddressInterface[]
}