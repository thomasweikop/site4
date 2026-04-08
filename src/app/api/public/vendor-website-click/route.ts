import { createSuperadminLog } from "@/lib/superadminStore";

type VendorWebsiteClickPayload = {
  vendorName?: string;
  website?: string;
  source?: string;
  sessionId?: string;
  areaKey?: string;
  actorEmail?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | VendorWebsiteClickPayload
    | null;

  if (!payload?.vendorName || !payload.website) {
    return Response.json(
      { ok: false, error: "Manglende vendorName eller website." },
      { status: 400 },
    );
  }

  await createSuperadminLog({
    actorType: "user",
    actorEmail: payload.actorEmail,
    action: "vendor_website_click",
    entityType: "vendor",
    entityId: payload.vendorName,
    payload: {
      vendorName: payload.vendorName,
      website: payload.website,
      source: payload.source || "unknown",
      sessionId: payload.sessionId || null,
      areaKey: payload.areaKey || null,
    },
  });

  return Response.json({ ok: true });
}
