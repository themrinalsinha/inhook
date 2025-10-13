import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { RequestBodyContainer } from "@/components/Dashboard/RequestBodyContainer"
import { JsonViewer as _JSONViewer } from "@/components/JsonViewer/JsonViewer";
import _XMLViewer from "react-xml-viewer";
import type { IWebhookEvent } from "@/types/webhook";
import { useMemo } from "react";
// import ParseRawHTTP from "@/lib/ParseRawHTTP";

const _TableViewer = ({ data }: { data: Record<string, string> }) => {
  return (
    <Table>
      <TableBody>
        {Object.entries(data).map(([key, value]) => (
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">{key}</TableHead>
            <TableCell className="w-2/3">{value as string}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const RequestHeader = ({ headers }: { headers: Record<string, string> }) => {
  return (
    <RequestBodyContainer>
      <_TableViewer data={headers} />
    </RequestBodyContainer>
  );
};

const _getContentData = (content_type: string, body: any): React.ReactNode => {
  if (content_type.includes("application/json")) {
    const parsedBody = JSON.parse(body);
    return <_JSONViewer data={parsedBody} />
  } else if (content_type.includes("application/xml")) {
    return (
      <div className="text-sm p-2">
        <_XMLViewer xml={body} collapsible={true} indentSize={4} />
      </div>
    );
  } else {
    return "";
  }
}

const RequestContent = ({
  content,
}: {
  content: {
    queryParams: Record<string, string>;
    headers: Record<string, string>;
    body: any;
  };
}) => {
  const contentType = content.headers["Content-Type"] || "";
  const contentData = useMemo(() => {
    return _getContentData(contentType, content.body);
  }, [contentType, content.body]);

  return (
    <RequestBodyContainer>
      {Object.keys(content.queryParams).length > 0 && (
        <div className="mb-2 p-2 outline-1 outline-neutral-200 rounded-lg">
          <p className="text-sm font-semibold text-neutral-500">Query params</p>
          <_TableViewer data={content.queryParams} />
        </div>
      )}

      {contentData && (
        <div className="p-2 outline-1 outline-neutral-200 rounded-lg">
          <p className="text-sm font-semibold text-neutral-500">Request Body</p>
          {contentData}
        </div>
      )}
    </RequestBodyContainer>
  );
};

const RequestRaw = ({ rawData }: { rawData: Uint8Array }) => {
  console.log(rawData);
  return (
    <RequestBodyContainer>
      <div className="text-sm text-neutral-500 whitespace-pre-wrap p-2">
        {/* <ParseRawHTTP rawData={rawData} /> */}
        TBD: RAW DATA VIEWER
      </div>
    </RequestBodyContainer>
  );
}

export const RequestDetailBody = ({
  selectedEvent,
}: {
  selectedEvent: IWebhookEvent;
}) => {

  const headersObj = {
    "Host": selectedEvent.host,
    "Remote Addr": selectedEvent.remote_addr,
    ...JSON.parse(selectedEvent.headers)
  };

  const content = {
    queryParams: selectedEvent.query_params
      ? JSON.parse(selectedEvent.query_params)
      : {},
    headers: selectedEvent.headers
      ? JSON.parse(selectedEvent.headers)
      : {},
    body: selectedEvent.body || null,
  };

  return (
    <div>
      <p className="text-md font-semibold text-neutral-500 mt-2 mb-2">
        Request Preview
      </p>
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
