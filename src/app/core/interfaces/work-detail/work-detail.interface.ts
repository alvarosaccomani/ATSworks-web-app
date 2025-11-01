import { DataTypeInterface } from "../data-type"

export interface WorkDetailInterface {
    cmp_uuid: string | null,
    wrk_uuid: string | null,
    wrkd_uuid: string | null,
    wrkd_key: string | null,
    wrkd_name: string | null,
    wrkd_description: string | null,
    dtp_uuid: string | null,
    dtp?: DataTypeInterface | null,
    wrkd_value: string | null,
    wrkd_groupkey: string | null,
    wrkd_createdat: Date | null,
    wrkd_updatedat?: Date | null
}