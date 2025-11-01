export interface GroupDetailModelItemInterface {
    cmp_uuid: string | null,
    itm_uuid: string | null,
    cmpitm_uuid: string | null,
    mitm_uuid: string | null,
    gdmitm_uuid: string | null,
	gdmitm_key: string | null,
    gdmitm_name: string | null,
	gdmitm_description: string | null,
	gdmitm_order: number | null,
	gdmitm_active: boolean | null,
	gdmitm_createdat: Date | null,
    gdmitm_updatedat: Date | null
}