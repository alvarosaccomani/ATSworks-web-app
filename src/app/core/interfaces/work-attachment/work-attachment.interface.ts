export interface WorkAttachmentInterface {
    cmp_uuid: string | null,
    wrk_uuid: string | null,
    wrka_uuid: string | null,
    wrka_attachmenttype: string | null,
    wrka_filepath: string | null,
    wrka_createdat: Date | null,
    wrka_updatedat?: Date | null
}