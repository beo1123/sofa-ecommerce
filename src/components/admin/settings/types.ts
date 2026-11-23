export interface SerializedAuditLog {
  id: number;
  actorId: number | null;
  actorEmail: string | null;
  actorName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  changes: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditActorOption {
  id: number;
  email: string;
  displayName: string | null;
}

export interface WorkshopOverviewInfo {
  adminUsersCount: number;
  productsCount: number;
  ordersCount: number;
  inquiriesCount: number;
  auditLogsCount: number;
}
