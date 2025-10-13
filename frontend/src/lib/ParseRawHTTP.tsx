// @ts-nocheck

import { useMemo } from "react";
import parser from "http-message-parser";

type _ParsedRawHTTPResponse = {};

const ProcessRawHTTP = (rawData: Uint8Array): _ParsedRawHTTPResponse => {
  const binary = atob(rawData);
  const parsed = parser(binary);

  return parsed.headers
};

export default function ParseRawHTTP({ rawData }: { rawData: Uint8Array }) {
  const parsed = useMemo(() => ProcessRawHTTP(rawData), [rawData]);

  return <div>{JSON.stringify(parsed)}</div>;
}
