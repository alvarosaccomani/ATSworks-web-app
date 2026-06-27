export interface MenuInterface {
    mnu_uuid: string | null,
    mnu_parent_uuid: string | null,
    mnu_cod: string | null,
    mnu_title: string | null,
    mnu_description: string | null,
    mnu_icon: string | null,
    mnu_route: string | null,
    mnu_order: number | null,
    mnu_itemactive: boolean | null,
    mnu_active: boolean | null,
    mnu_showifcompanyactive: boolean | null,
    mnu_createdat: Date | null,
    mnu_updatedat: Date | null,
    per_uuid?: string | null,
    appPermission?: string | null,
    allowedRoles?: string[],
    items?: MenuInterface[]
}