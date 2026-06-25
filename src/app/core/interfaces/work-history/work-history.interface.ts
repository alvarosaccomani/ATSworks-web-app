import { UserInterface } from "../user/user.interface";
import { WorkStateInterface } from "../work-state/work-state.interface";

export interface WorkHistoryInterface {
  cmp_uuid: string;
  wrk_uuid: string;
  wrkh_uuid: string;
  wrks_uuid: string;
  usr_uuid: string;
  wrkh_comment: string;
  wrkh_createdat: string; // Formateada como ISO string
  wrks?: WorkStateInterface | null;
  usr?: Partial<UserInterface> | null;
}
