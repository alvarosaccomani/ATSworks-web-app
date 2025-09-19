import { CustomerInterface } from "../customer"

export interface AddressInterface {
    cmp_uuid: string | null,
    adr_uuid: string | null,
    cus_uuid: string | null,
    cus: CustomerInterface | null,
    adr_address: string | null,
    adr_city: string | null,
    adr_province: string | null,
    adr_postalcode: string | null,
    adr_createdat: Date | null,
    adr_updatedat: Date | null
}