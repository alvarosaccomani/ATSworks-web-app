import { PermissionInterface } from "../permission/permission.interface"
import { RolInterface } from "../rol/rol.interface"

export interface RolPermissionInterface {
    rol_uuid: string | null,
    rol: RolInterface | null,
    per_uuid: string | null,
    per: PermissionInterface | null,
    rolper_createdat: Date | null,
    rolper_updatedat: Date | null
}