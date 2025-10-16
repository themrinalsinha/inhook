import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RequestBodyContainer } from "@/components/Dashboard/RequestBodyContainer";
import { JsonViewer } from "@/components/JsonViewer/JsonViewer";
import XMLViewer from "react-xml-viewer";
import type { IWebhookEvent } from "@/types/webhook";
import { useMemo } from "react";
import { ParseRawHTTP, GetParsedMultipartData } from "@/lib/ParseRawHTTP";
import { TableViewer } from "@/components/Utils/Viewers";


const RequestHeader = ({ headers }: { headers: Record<string, string> }) => {
  return (
    <RequestBodyContainer>
      <TableViewer data={headers} />
    </RequestBodyContainer>
  );
};

const _getContentData = (
  content_type: string,
  content: any
): React.ReactNode => {
  // JSON
  if (content_type.includes("application/json")) {
    const parsedBody = JSON.parse(content.body);
    return <JsonViewer data={parsedBody} />;
  }

  // XML
  if (content_type.includes("application/xml")) {
    return (
      <div className="text-sm p-2">
        <XMLViewer xml={content.body} collapsible={true} indentSize={4} />
      </div>
    );
  }

  // YAML + Text + HTML
  if (
    content_type.includes("application/yaml") ||
    content_type.includes("application/edn") ||
    content_type.includes("text/plain") ||
    content_type.includes("text/html")
  ) {
    return (
      <pre className="text-sm whitespace-pre-wrap p-2">{content.body}</pre>
    );
  }

  // Multipart
  if (content_type.includes("multipart/form-data")) {
    return <GetParsedMultipartData rawData={content.rawData} />;
  }

  // Other
  return null;
};

const RequestContent = ({
  content,
}: {
  content: {
    queryParams: Record<string, string>;
    headers: Record<string, string>;
    body: any;
    formData: Record<string, string>;
    rawData: string
  };
}) => {
  const contentTypeHeader = content.headers["Content-Type"];

  const contentTypeStr = Array.isArray(contentTypeHeader)
    ? contentTypeHeader.join(", ")
    : contentTypeHeader;
  const contentType = contentTypeStr?.split(";")[0]?.trim() ?? "";

  const contentData = useMemo(
    () => _getContentData(contentType, content),
    [contentType, content]
  );

  return (
    <RequestBodyContainer>
      {contentType && (
        <p className="flex justify-end items-center text-sm text-neutral-400 mb-2">
          Content Type: {contentType}
        </p>
      )}

      <div className="mb-2 p-2 outline-1 outline-neutral-200 rounded-lg">
        <p className="text-sm font-semibold text-neutral-500">Query params</p>
        <TableViewer data={content.queryParams} />
      </div>

      <div className="mb-2 p-2 outline-1 outline-neutral-200 rounded-lg">
        <p className="text-sm font-semibold text-neutral-500">Form Data</p>
        <TableViewer data={content.formData} />
      </div>

      <div className="mb-2 p-2 outline-1 outline-neutral-200 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-neutral-500">
            Request Body / Multipart Data
          </p>
        </div>
        {contentData}
      </div>
    </RequestBodyContainer>
  );
};

const RequestRaw = ({ rawData }: { rawData: string }) => {
  return (
    <RequestBodyContainer>
      <div className="text-sm text-neutral-500 whitespace-pre-wrap p-2">
        <ParseRawHTTP rawData={rawData} />
      </div>
    </RequestBodyContainer>
  );
};

export const RequestDetailBody = ({
  selectedEvent,
}: {
  selectedEvent: IWebhookEvent;
}) => {
  const headersObj = {
    Host: selectedEvent.host,
    // "Remote Addr": selectedEvent.remote_addr,
    ...JSON.parse(selectedEvent.headers),
  };

  const content = {
    queryParams: selectedEvent.query_params
      ? JSON.parse(selectedEvent.query_params)
      : {},
    formData: selectedEvent.form_data
      ? JSON.parse(selectedEvent.form_data)
      : {},
    headers: selectedEvent.headers ? JSON.parse(selectedEvent.headers) : {},
    body: selectedEvent.body || null,
    rawData: selectedEvent.raw_data,
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text-md font-semibold text-neutral-500 mt-2 mb-2">
          Request Preview
        </p>
        <p className="text-sm font-normal text-neutral-500">
          {selectedEvent?.request_id
            ? `ID: ${selectedEvent.request_id.slice(0, 8)}`
            : ""}
        </p>
      </div>

      <Tabs defaultValue="header">
        <TabsList className="w-full">
          <TabsTrigger value="header" className="text-neutral-700">
            Header
          </TabsTrigger>
          <TabsTrigger value="content" className="text-neutral-700">
            Content
          </TabsTrigger>
          <TabsTrigger value="raw" className="text-neutral-700">
            Raw
          </TabsTrigger>
        </TabsList>
        <TabsContent value="header">
          <RequestHeader headers={headersObj} />
        </TabsContent>
        <TabsContent value="content">
          <RequestContent content={content} />
        </TabsContent>
        <TabsContent value="raw">
          <RequestRaw rawData={selectedEvent.raw_data} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
