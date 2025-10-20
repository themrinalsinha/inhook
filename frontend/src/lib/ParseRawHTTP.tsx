// @ts-nocheck

import { useCallback, type ReactNode } from "react";
import { useMemo } from "react";
import parser from "http-message-parser";
import { TableViewer } from "@/components/Utils/Viewers";
import { DownloadIcon } from "lucide-react";

const useDownload = () => {
  return useCallback(
    (data: Uint8Array, contentType: "application/octet-stream", filename) => {
      const blob = new Blob([data], { type: contentType });

      if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
    },
    []
  );
};

const _parseHeaders = (headers: Record<string, any>) : Record<string, any> => {
  const headersObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(headers)) {
    const _key = key.toLowerCase();
    if (_key === "content-disposition" || _key === "content-type") {
      headersObj[_key] = {};
      const [mainType, ...params] = value.split(";");
      headersObj[_key].type = mainType.trim();
      params.forEach((param) => {
        const [pKey, pVal] = param.split("=").map((x) => x && x.trim());
        if (pKey && pVal !== undefined) {
          // Remove quotes if any
          headersObj[_key][pKey] = pVal.replace(/^"|"$/g, "");
        }
      });
    } else {
      headersObj[_key] = value;
    }
  }
  return headersObj;
};

const _getDecodedTextBody = (body: Uint8Array): ReactNode => {
  const text = new TextDecoder().decode(body);
  return <pre className="text-sm whitespace-pre-wrap">{text.trim()}</pre>;
}

const _getDecodedBinaryBody = (
  body: Uint8Array,
  contentType: string,
  filename: string
): ReactNode => {
  // how to get size of binary body in human readable format?
  const size = body.length;
  const sizeInHumanReadable =
    size > 1024 ? `${(size / 1024).toFixed(2)} KB` : `${size} B`;
  const download = useDownload();

  return (
    <div className="flex items-center justify-between rounded-md w-full">
      <span className="text-sm">
        {filename} <span className="text-neutral-500">({contentType})</span>
      </span>
      <span className="flex items-center justify-center">
        <p className="text-sm text-neutral-500">{sizeInHumanReadable}</p>
        <a
          onClick={() => download(body, contentType, filename)}
          className="ml-2 cursor-pointer"
        >
          <DownloadIcon className="size-4 text-neutral-500 hover:text-neutral-700" />
        </a>
      </span>
    </div>
  );
};

const _processMultipartData = (rawData: string) => {
  const binary = atob(rawData);
  const parsed = parser(binary);

  const formData = {};
  const multipartData = parsed.multipart;

  for (const data of multipartData) {
    const headers = _parseHeaders(data.headers);
    const contentType = headers["content-type"];

    const isTextContentType =
      contentType?.type.includes("text/") ||
      contentType?.type.includes("application/json") ||
      contentType?.type.includes("application/xml") ||
      contentType?.type.includes("application/yaml") ||
      contentType?.type.includes("application/edn") ||
      contentType?.type.includes("application/html");

    if (!contentType || isTextContentType) {
      formData[headers["content-disposition"]?.name] = _getDecodedTextBody(
        data.body
      );
    } else {
      formData[headers["content-disposition"]?.name] = _getDecodedBinaryBody(
        data.body,
        contentType?.type || "application/octet-stream",
        headers["content-disposition"]?.filename || "filename"
      );
    }
  }

  return formData;
};

export const GetParsedMultipartData = (
  { rawData }: { rawData: string }
): ReactNode => {
  const formData = _processMultipartData(rawData);
  return <TableViewer data={formData} />
};

export function ParseRawHTTP({ rawData }: { rawData: string }) {
  const rawStr = atob(rawData);

  return (
    <pre className="text-sm whitespace-pre-wrap p-2">
      {rawStr}
    </pre>
  )
}
