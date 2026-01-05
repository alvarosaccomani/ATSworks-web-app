import { AddressInterface } from "../address";
import { WorkStateInterface } from "../work-state";
import { UserInterface } from "../user";
import { ModelItemInterface } from "../model-item";
import { WorkDetailInterface } from "../work-detail";
import { WorkAttachmentInterface } from "../work-attachment";

export interface WorkInterface {
    cmp_uuid: string | null,
    wrk_uuid: string | null,
    adr_uuid: string | null,
    adr: AddressInterface | null,
    wrk_description: string | null,
    wrk_workdate: Date | null,
    wrk_workdateinit: Date | null,
    wrk_workdatefinish: Date | null,
    wrks_uuid: string | null,
    wrks: WorkStateInterface | null,
    wrk_user_uuid: string | null,
    wrk_user: UserInterface | null,
    wrk_operator_uuid1: string | null,
    wrk_operator1: UserInterface | null,
    wrk_operator_uuid2: string | null,
    wrk_operator2: UserInterface | null,
    wrk_operator_uuid3: string | null,
    wrk_operator3: UserInterface | null,
    wrk_operator_uuid4: string | null,
    wrk_operator4: UserInterface | null,
    wrk_customer: string | null,
    wrk_address: string | null,
    wrk_coordinates: string | null,
    wrk_phone: string | null,
    twrk_uuid: string | null,
    wrk_route: string | null,
    itm_uuid: string | null,
    cmpitm_uuid: string | null,
    mitm_uuid: string | null,
    mitm: ModelItemInterface | null,
	wrk_createdat: Date | null,
    wrk_updatedat: Date | null,
    workDetails?: WorkDetailInterface[],
    workAttachments?: WorkAttachmentInterface[]
}