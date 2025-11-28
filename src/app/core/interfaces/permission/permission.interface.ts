import { ResourceTypeInterface } from "../resource-type";
import { ResourceModuleInterface } from "../resource-module";

export interface PermissionInterface {
    per_uuid: string | null,
    per_slug: string | null,
    per_description: string,
    rety_uuid: string,
    rety?: ResourceTypeInterface,
    remo_uuid: string,   
    remo?: ResourceModuleInterface,
    per_createdat: Date | null,
    per_updatedat: Date | null
}