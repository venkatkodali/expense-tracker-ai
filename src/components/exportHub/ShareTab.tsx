"use client";

import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import type { useExportHub } from "@/hooks/useExportHub";

export function ShareTab({ hub }: { hub: ReturnType<typeof useExportHub> }) {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await hub.generateShareLink();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      showToast("Couldn't copy — your browser blocked clipboard access.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-dashed border-hairline bg-page px-4 py-3 text-xs text-muted">
        Prototype only — this link doesn&rsquo;t resolve to a real page and nothing is uploaded anywhere. It
        shows what a shareable export link and QR code would look like in a connected version.
      </div>

      <div className="flex items-center justify-between rounded-xl border border-hairline p-4">
        <div>
          <p className="text-sm font-medium text-primary">
            {hub.previewCount} record{hub.previewCount === 1 ? "" : "s"} from the selected template
          </p>
          <p className="text-xs text-muted">Generates a link + QR code for this data.</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          Generate link
        </button>
      </div>

      {hub.shareLinks.length > 0 && (
        <ul className="space-y-3">
          {hub.shareLinks.map((link) => (
            <li key={link.id} className="flex flex-col gap-3 rounded-xl border border-hairline p-4 sm:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element -- locally generated data: URL, not a remote/optimizable image */}
              <img
                src={link.qrDataUrl}
                alt={`QR code for ${link.templateName} share link`}
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 rounded-lg border border-hairline bg-white p-1"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary">
                  {link.templateName} · {link.recordCount} record{link.recordCount === 1 ? "" : "s"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="truncate rounded bg-page px-2 py-1 text-xs text-secondary">{link.url}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(link.id, link.url)}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-hairline px-2 py-1 text-xs font-medium text-primary hover:bg-page"
                  >
                    {copiedId === link.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
