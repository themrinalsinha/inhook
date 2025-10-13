// @ts-nocheck

import { useMemo } from "react";

/**
 * Props:
 *  - base64Dump: string  // base64 string of httputil.DumpRequest(r, true)
 */
export default function ParseHttpDump({ base64Dump }) {
  const parsed = useMemo(() => parseDumpBase64(base64Dump), [base64Dump]);

  if (!base64Dump) return <div>Provide base64 dump</div>;

  if (parsed.error)
    return <div style={{ color: "crimson" }}>Error: {parsed.error}</div>;

  const {
    requestLine,
    headers,
    bodyKind,
    bodyRawText,
    bodyJson,
    multipartParts,
  } = parsed;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.4 }}>
      <h3>Request</h3>
      <div style={{ background: "#f6f8fa", padding: 10, borderRadius: 6 }}>
        <div>
          <strong>{requestLine}</strong>
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Headers:</strong>
          <pre style={{ whiteSpace: "pre-wrap", margin: 6 }}>
            {headersToString(headers)}
          </pre>
        </div>
      </div>

      <h3 style={{ marginTop: 16 }}>Body ({bodyKind})</h3>

      {bodyKind === "empty" && <div>(no body)</div>}

      {bodyKind === "text" && (
        <pre
          style={{ whiteSpace: "pre-wrap", background: "#fff8", padding: 8 }}
        >
          {bodyRawText}
        </pre>
      )}

      {bodyKind === "json" && (
        <pre
          style={{ whiteSpace: "pre-wrap", background: "#fff8", padding: 8 }}
        >
          {JSON.stringify(bodyJson, null, 2)}
        </pre>
      )}

      {bodyKind === "multipart" && (
        <div>
          <div style={{ marginBottom: 8 }}>Parts: {multipartParts.length}</div>
          {multipartParts.map((part, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #e6e6e6",
                padding: 8,
                marginBottom: 8,
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 13, color: "#333" }}>
                <strong>Part {idx + 1}</strong> — headers:
              </div>
              <pre style={{ whiteSpace: "pre-wrap", margin: 6 }}>
                {headersToString(part.headers)}
              </pre>

              {part.isFile ? (
                <div>
                  <div>
                    Filename:{" "}
                    <strong>{part.filename || "(no filename)"}</strong>
                  </div>
                  <div>
                    Content-Type:{" "}
                    {part.contentType || "application/octet-stream"}
                  </div>
                  {part.contentType && part.contentType.startsWith("image/") ? (
                    <img
                      src={part.objectUrl}
                      alt={part.filename || `part-${idx + 1}`}
                      style={{ maxWidth: "100%", marginTop: 8 }}
                    />
                  ) : (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={part.objectUrl}
                        download={part.filename || `part-${idx + 1}`}
                      >
                        Download file
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ marginTop: 6 }}>
                    <strong>Value</strong>:
                    <pre style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
                      {part.text}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {bodyKind === "binary" && (
        <div>
          <div>
            Binary body (not multipart). Content-Type:{" "}
            {headers["content-type"] || "unknown"}
          </div>
          {headers["content-type"] &&
          headers["content-type"].startsWith("image/") ? (
            <img
              src={parsed.binaryObjectUrl}
              alt="binary-body"
              style={{ maxWidth: "100%", marginTop: 8 }}
            />
          ) : (
            <a href={parsed.binaryObjectUrl} download="body.bin">
              Download body
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------ Helpers / Parser ------------------ */

function base64ToUint8Array(b64) {
  if (!b64) return new Uint8Array(0);
  // atob -> binary string; then map charCodes
  const bin = atob(b64.replace(/\s+/g, "")); // remove whitespace/newlines
  const len = bin.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function headersToString(headersObj) {
  return Object.entries(headersObj || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function parseDumpBase64(base64Dump) {
  try {
    const bytes = base64ToUint8Array(base64Dump);
    if (bytes.length === 0) return { error: "Empty input" };

    // find first CRLFCRLF sequence -> headers end
    const headerBreakIndex = findSequence(bytes, [13, 10, 13, 10]); // \r\n\r\n
    if (headerBreakIndex === -1) {
      return { error: "Could not find header/body separator (\\r\\n\\r\\n)" };
    }

    const headerBytes = bytes.slice(0, headerBreakIndex);
    const bodyBytes = bytes.slice(headerBreakIndex + 4);

    const tdUtf8 = new TextDecoder("utf-8");
    const headerText = tdUtf8.decode(headerBytes);

    // first line is request-line (e.g. "POST /path HTTP/1.1")
    const lines = headerText.split(/\r\n|\n/);
    const requestLine = lines[0] || "";

    const headers = {};
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const idx = line.indexOf(":");
      if (idx !== -1) {
        const name = line.slice(0, idx).trim().toLowerCase();
        const val = line.slice(idx + 1).trim();
        // merge multi headers naively
        if (headers[name]) headers[name] = headers[name] + ", " + val;
        else headers[name] = val;
      }
    }

    // Decide body type
    if (bodyBytes.length === 0) {
      return { requestLine, headers, bodyKind: "empty" };
    }

    const contentType = headers["content-type"] || "";
    // If JSON or text-like
    if (contentType.includes("application/json")) {
      try {
        const bodyText = tdUtf8.decode(bodyBytes);
        const json = JSON.parse(bodyText);
        return { requestLine, headers, bodyKind: "json", bodyJson: json };
      } catch (e) {
        // fallback to text
        const bodyText = tdUtf8.decode(bodyBytes);
        return {
          requestLine,
          headers,
          bodyKind: "text",
          bodyRawText: bodyText,
        };
      }
    }

    if (contentType.startsWith("multipart/form-data")) {
      // extract boundary param: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
      const bmatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
      if (!bmatch) {
        return {
          requestLine,
          headers,
          bodyKind: "multipart",
          multipartParts: [],
          error: "No boundary in content-type",
        };
      }
      const boundary = (bmatch[1] || bmatch[2]).trim();
      const parts = parseMultipart(bodyBytes, boundary);
      return {
        requestLine,
        headers,
        bodyKind: "multipart",
        multipartParts: parts,
      };
    }

    // If other textual types (form-urlencoded, plain text)
    if (
      contentType.startsWith("application/x-www-form-urlencoded") ||
      contentType.startsWith("text/")
    ) {
      const txt = tdUtf8.decode(bodyBytes);
      return { requestLine, headers, bodyKind: "text", bodyRawText: txt };
    }

    // Otherwise it's binary (image/upload etc.)
    const binaryMime = contentType || "application/octet-stream";
    const binaryBlob = new Blob([bodyBytes], { type: binaryMime });
    const binaryObjectUrl = URL.createObjectURL(binaryBlob);
    return { requestLine, headers, bodyKind: "binary", binaryObjectUrl };
  } catch (err) {
    return { error: String(err) };
  }
}

/**
 * Find sequence of bytes `seq` inside `hay` Uint8Array. Return first index or -1.
 */
function findSequence(hay, seq) {
  if (!hay || hay.length === 0) return -1;
  outer: for (let i = 0; i <= hay.length - seq.length; i++) {
    for (let j = 0; j < seq.length; j++) {
      if (hay[i + j] !== seq[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/**
 * Parse multipart body bytes using given boundary string (without the leading --).
 * Strategy:
 *  - Convert body bytes to ISO-8859-1 string (1:1 byte->char) to safely split boundaries,
 *    then map part bodies back to byte arrays by charCode conversion.
 */
function parseMultipart(bodyBytes, boundary) {
  const tdLatin1 = new TextDecoder("iso-8859-1"); // preserve raw bytes as one-to-one
  const bodyText = tdLatin1.decode(bodyBytes);
  const delim = `--${boundary}`;
  // Split by delim, but ignore preamble and final -- terminator
  const rawParts = bodyText.split(delim).slice(1); // first chunk before first delim is preamble
  const parts = [];

  for (let raw of rawParts) {
    // final boundary ends with '--' maybe plus CRLF; skip final empty
    if (raw === "--" || raw.trim() === "--" || raw.trim() === "") continue;
    // trim leading CRLF if present
    if (raw.startsWith("\r\n")) raw = raw.slice(2);
    // now raw contains: part-headers\r\n\r\npart-body\r\n
    const headerSplit = raw.indexOf("\r\n\r\n");
    if (headerSplit === -1) continue;
    const headerText = raw.slice(0, headerSplit);
    const partBodyText = raw.slice(headerSplit + 4, raw.lastIndexOf("\r\n")); // strip trailing CRLF

    // parse part headers
    const phLines = headerText.split(/\r\n|\n/);
    const partHeaders = {};
    for (let l of phLines) {
      const idx = l.indexOf(":");
      if (idx === -1) continue;
      const k = l.slice(0, idx).trim().toLowerCase();
      const v = l.slice(idx + 1).trim();
      partHeaders[k] = v;
    }

    // content-disposition parsing for name/filename
    const cd = partHeaders["content-disposition"] || "";
    const nameMatch = cd.match(/name=(?:"([^"]+)"|([^;]+))/i);
    const filenameMatch = cd.match(/filename=(?:"([^"]+)"|([^;]+))/i);
    const pname = nameMatch ? nameMatch[1] || nameMatch[2] : undefined;
    const filename = filenameMatch
      ? filenameMatch[1] || filenameMatch[2]
      : undefined;

    // convert partBodyText (latin1 string) back to Uint8Array preserving bytes
    const partBytes = new Uint8Array(partBodyText.length);
    for (let i = 0; i < partBodyText.length; i++)
      partBytes[i] = partBodyText.charCodeAt(i);

    const contentType = partHeaders["content-type"] || "";

    const isFile =
      !!filename || (!!contentType && !contentType.startsWith("text/"));

    // create blob / object URL if file
    let objectUrl = null;
    if (isFile) {
      const blob = new Blob([partBytes], {
        type: contentType || "application/octet-stream",
      });
      objectUrl = URL.createObjectURL(blob);
    }

    // decode text (UTF-8) for non-file parts if possible
    let text = null;
    if (!isFile) {
      try {
        text = new TextDecoder("utf-8").decode(partBytes);
      } catch (e) {
        text = tdLatin1.decode(partBytes);
      }
    }

    parts.push({
      headers: partHeaders,
      name: pname,
      filename,
      contentType,
      isFile,
      bytes: partBytes,
      objectUrl,
      text,
    });
  }

  return parts;
}
