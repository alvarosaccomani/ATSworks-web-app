export interface RouteInterface {
    cmp_uuid: string,
    rou_uuid: string | null,
    rou_name: string | null,
    rou_order: number,
    rou_description: string,
    rou_bkcolor: string,
    rou_frcolor: string,
    rou_active: boolean,
    rou_createdat: Date | null,
    rou_updatedat: Date | null
}