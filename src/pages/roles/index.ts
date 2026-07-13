import { ShieldCheck } from "lucide-react";
import type { RaRecord } from "ra-core";
import RoleCreate from "./RoleCreate";
import RoleEdit from "./RoleEdit";
import RoleList from "./RoleList";

const roles = {
  list: RoleList,
  create: RoleCreate,
  edit: RoleEdit,
  icon: ShieldCheck,
  recordRepresentation: (record: RaRecord) =>
    (record?.name as string) ?? String(record?.id ?? ""),
};

export default roles;
