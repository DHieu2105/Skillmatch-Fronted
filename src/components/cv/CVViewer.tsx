import Link from "next/link";

interface CVViewerProps {
  backHref: string;
  backLabel: string;
  fileName: string;
  fileUrl: string;
  ownerName?: string;
}

export default function CVViewer({
  backHref,
  backLabel,
  fileName,
  fileUrl,
  ownerName,
}: CVViewerProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={backHref}
            className="text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            &larr; {backLabel}
          </Link>

          <p className="mt-4 text-sm font-semibold text-violet-600">
            Curriculum Vitae
          </p>
          <h1 className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            {fileName}
          </h1>
          {ownerName && (
            <p className="mt-2 text-sm text-slate-500">
              CV submitted by {ownerName}
            </p>
          )}
        </div>

        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="w-fit rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Open PDF in new tab
        </a>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <iframe
          src={fileUrl}
          title={`CV: ${fileName}`}
          className="h-[calc(100vh-220px)] min-h-[640px] w-full bg-slate-100"
        />
      </section>
    </div>
  );
}
