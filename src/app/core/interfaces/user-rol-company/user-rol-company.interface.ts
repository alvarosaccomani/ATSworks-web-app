import { CompanyInterface } from "../company"
import { RolInterface } from "../rol"

export interface UserRolCompanyInterface {
    cmp_uuid: string | null,
    cmp: CompanyInterface | null,
    usrrolcmp_uuid: string | null,
    usr_uuid: string | null,
    rol_uuid: string | null,
    rol: RolInterface | null,
    usrrolcmp_createdat: Date | null,
    usrrolcmp_updatedat: Date | null
}