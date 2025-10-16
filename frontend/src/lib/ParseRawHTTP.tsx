// @ts-nocheck

import { useMemo } from "react";
import parser from "http-message-parser";

type _ParsedRawHTTPResponse = {};

const ProcessRawHTTP = (rawData: string): _ParsedRawHTTPResponse => {
  const binary = atob(rawData);
  const parsed = parser(binary);
  return parsed
};

export default function ParseRawHTTP({ rawData }: { rawData: string }) {
  const rawStr = atob(rawData);

  return (
    <pre className="text-sm whitespace-pre-wrap p-2">
      {rawStr}
    </pre>
  )
}
