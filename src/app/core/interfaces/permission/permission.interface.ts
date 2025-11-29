import { ResourceTypeInterface } from "../resource-type";
import { ResourceModuleInterface } from "../resource-module";

export interface PermissionInterface {
    per_uuid: string | null,
    per_slug: string | null,
    per_description: string | null,
    rety_uuid: string | null,
    rety?: ResourceTypeInterface | null,
    remo_uuid: string | null,   
    remo?: ResourceModuleInterface | null,
    per_createdat: Date | null,
    per_updatedat: Date | null
}