// @ts-nocheck

import type { ReactNode } from "react";
import { useMemo } from "react";
import parser from "http-message-parser";

const _processMultipartData = (rawData: string) => {
  const binary = atob(rawData);
  const parsed = parser(binary);
  console.log("Parsed ---> ", parsed)
  return null
}

export const GetParsedMultipartData = (
  { rawData }: { rawData: string }
): ReactNode => {
  _processMultipartData(rawData)
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
