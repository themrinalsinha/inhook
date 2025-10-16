// @ts-nocheck

import type { ReactNode } from "react";
import { useMemo } from "react";
import parser from "http-message-parser";

type _ParsedRawHTTPResponse = {};

export const GetParsedMultipartData = (
  { rawData }: { rawData: string }
): ReactNode => {
  const binary = atob(rawData);
  const parsed = parser(binary);

  return <></>
};

export function ParseRawHTTP({ rawData }: { rawData: string }) {
  const rawStr = atob(rawData);

  return (
    <pre className="text-sm whitespace-pre-wrap p-2">
      {rawStr}
    </pre>
  )
}
