import { WorkDetailInterface } from "../work-detail";

export interface WorkInterface {
    cmp_uuid: string | null,
    wrk_uuid: string | null,
    adr_uuid: string | null,
    wrk_description: string | null,
    wrk_workdate: Date | null,
    wrk_workdateinit: Date | null,
    wrk_workdatefinish: Date | null,
    wrks_uuid: string | null,
    wrk_user_uuid: string | null,
    wrk_operator_uuid: string | null,
    itm_uuid: string | null,
    cmpitm_uuid: string | null,
    mitm_uuid: string | null,
	wrk_createdat: Date | null,
    wrk_updatedat: Date | null,
    detailWorks?: WorkDetailInterface[]
}