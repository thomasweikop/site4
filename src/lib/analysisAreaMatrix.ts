import type { MatrixAreaKey, VendorDirectoryEntry } from "@/lib/nis2BuildPack";

export const ANALYSIS_AREA_TO_MATRIX_KEYS: Record<string, MatrixAreaKey[]> = {
  "governance-risk-management": [
    "governance",
    "governance-responsibility",
    "policies-documentation",
    "risk-assessment",
  ],
  "incident-management": [
    "operational",
    "incident-response",
    "logging-monitoring",
  ],
  "business-continuity-disaster-recovery": [
    "operational",
    "backup-recovery-continuity",
  ],
  "supply-chain-security": ["compliance", "supplier-management"],
  "security-in-network-information-systems": [
    "technical",
    "asset-access-overview",
    "logging-monitoring",
  ],
  "access-control-identity-management": [
    "technical",
    "identity-mfa-pam",
    "asset-access-overview",
  ],
  "vulnerability-patch-management": [
    "technical",
    "asset-access-overview",
    "audit-assurance",
  ],
  "monitoring-detection-logging": [
    "technical",
    "operational",
    "logging-monitoring",
  ],
  "cryptography-data-protection": [
    "technical",
    "compliance",
    "identity-mfa-pam",
  ],
  "awareness-training": ["operational", "training-awareness"],
};

export function getMatrixKeysForAnalysisArea(areaKey: string) {
  return (ANALYSIS_AREA_TO_MATRIX_KEYS[areaKey] ?? []) as MatrixAreaKey[];
}

export function vendorMatchesAnalysisArea(
  vendor: VendorDirectoryEntry,
  areaKey: string,
) {
  return getMatrixKeysForAnalysisArea(areaKey).some(
    (matrixKey) => vendor.matrixAreas[matrixKey],
  );
}
