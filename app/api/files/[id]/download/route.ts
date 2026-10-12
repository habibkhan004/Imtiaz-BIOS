import { NextRequest, NextResponse } from "next/server";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { assertCanDownload } from "@/app/lib/server/entitlement";
import { fileStorage, contentTypeFromName, contentDisposition } from "@/app/lib/server/file-storage";
import { jsonError, rateLimit, requireSession } from "@/app/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const rl = rateLimit(`dl:${req.headers.get("x-forwarded-for") || "local"}`, 60, 60_000);
  if (!rl.ok) return rl.response;

  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const db = await loadDb();
  const file = db.files.find((f) => f.id === id);
  if (!file) return jsonError("File not found", 404);

  const user = db.users.find((u) => u.id === auth.user.id)!;
  const ent = assertCanDownload(db, user, file);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ua = req.headers.get("user-agent") || undefined;

  if (!ent.ok) {
    await updateDb((d) => {
      d.downloads.unshift({
        id: randomUUID(),
        userId: user.id,
        fileId: file.id,
        at: now(),
        ip,
        ua,
        result: "denied",
      });
    });
    return jsonError(ent.message, 403, "NO_ENTITLEMENT");
  }

  await updateDb((d) => {
    const f = d.files.find((x) => x.id === id);
    if (f) f.downloadCount += 1;
    d.downloads.unshift({
      id: randomUUID(),
      userId: user.id,
      fileId: file.id,
      at: now(),
      ip,
      ua,
      result: "success",
    });
  });

  const hasBinary =
    file.storageKey &&
    file.storageKey !== "seed-demo-no-binary" &&
    file.storageKey !== "pending-upload" &&
    (await fileStorage.exists(file.storageKey));

  if (hasBinary) {
    try {
      const buf = await fileStorage.read(file.storageKey);
      // Serve as original type: PDF stays PDF, ZIP stays ZIP, etc.
      const fileName = file.originalName || file.storageKey;
      return new NextResponse(new Uint8Array(buf), {
        status: 200,
        headers: {
          "Content-Type": contentTypeFromName(fileName),
          "Content-Disposition": contentDisposition(fileName),
          "Cache-Control": "no-store",
          "X-Entitlement": ent.reason,
        },
      });
    } catch {
      await updateDb((d) => {
        d.downloads.unshift({
          id: randomUUID(),
          userId: user.id,
          fileId: file.id,
          at: now(),
          ip,
          ua,
          result: "error",
        });
      });
      return jsonError(
        "Object storage unavailable. Please retry shortly.",
        503,
        "STORAGE_UNAVAILABLE",
      );
    }
  }

  // Seed catalog rows without a stored object: authorized demo payload only
  // (not a public static path). Real uploads with missing keys fail above / here.
  if (
    file.storageKey === "pending-upload" ||
    (file.storageKey &&
      file.storageKey !== "seed-demo-no-binary" &&
      !(await fileStorage.exists(file.storageKey)))
  ) {
    return jsonError(
      "File binary is not available in secure storage yet.",
      503,
      "STORAGE_MISSING",
    );
  }

  const stub = Buffer.from(
    `IMTIAZ BIOS authorized download\nfile=${file.name}\nversion=${file.version}\nentitlement=${ent.reason}\n`,
    "utf8",
  );
  return new NextResponse(stub, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${(file.originalName || "download.bin").replace(/"/g, "")}"`,
      "Cache-Control": "no-store",
      "X-Entitlement": ent.reason,
      "X-Demo-Stub": "1",
    },
  });
}
