import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ fileId?: string }> };

/** Legacy portal URL → public full checkout page. */
export default async function PortalCheckoutRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const fileId = sp.fileId ? String(sp.fileId) : "";
  redirect(fileId ? `/checkout?fileId=${encodeURIComponent(fileId)}` : "/checkout");
}
