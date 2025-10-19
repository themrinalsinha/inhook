// @ts-nocheck

import type { ReactNode } from "react";
import { useMemo } from "react";
import parser from "http-message-parser";
import { TableViewer } from "@/components/Utils/Viewers";

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

const _processMultipartData = (rawData: string) => {
  const binary = atob(rawData);
  const parsed = parser(binary);

  const formData = {};
  const multipartData = parsed.multipart;

  for (const data of multipartData) {
    const headers = _parseHeaders(data.headers);
    const contentType = headers["content-type"];

    const isTextContentType = (
      contentType?.type.includes("text/") ||
      contentType?.type.includes("application/json") ||
      contentType?.type.includes("application/xml") ||
      contentType?.type.includes("application/yaml") ||
      contentType?.type.includes("application/edn") ||
      contentType?.type.includes("application/html")
    )

    if (!contentType || isTextContentType) {
      formData[headers["content-disposition"]?.name] = _getDecodedTextBody(
        data.body
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
