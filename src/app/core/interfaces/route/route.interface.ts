export interface RouteInterface {
    cmp_uuid: string | null,
    rou_uuid: string | null,
    rou_name: string | null,
    rou_order: number | null,
    rou_description: string | null,
    rou_bkcolor: string | null,
    rou_frcolor: string | null,
    rou_active: boolean | null,
    rou_createdat: Date | null,
    rou_updatedat: Date | null
}