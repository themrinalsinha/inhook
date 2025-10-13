import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { RequestBodyContainer } from "@/components/Dashboard/RequestBodyContainer"
import { JsonViewer } from "@/components/JsonViewer/JsonViewer";
import type { IWebhookEvent } from "@/types/webhook";
import ParseRawHTTP from "@/lib/ParseRawHTTP";


const RequestHeader = ({ headers }: { headers: Record<string, string> }) => {
  return (
    <RequestBodyContainer>
      <Table className="w-full text-sm text-neutral-500">
        <TableBody>
          {Object.entries(headers).map(([key, value]) => (
            <TableRow className="hover:bg-neutral-50">
              <TableHead className="w-1/3">{key}</TableHead>
              <TableCell className="w-2/3">{value as string}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RequestBodyContainer>
  );
};

const RequestContent = () => {

  const data = {
    string: "Hello, world!",
    number: 42,
    boolean: true,
    null: null,
    object: {
      nested: {
        value: "This is nested",
        array: [1, 2, 3],
      },
      empty: {},
    },
    array: [
      "string",
      123,
      false,
      {
        key: "value",
      },
      ["nested", "array"],
    ],
    longText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.",
    createdAt: "2025-10-07T03:53:05.167Z",
    apple: {
      apple: {
        apple: {}
      }
    },
    banana: {
      banana: {
        banana: {}
      }
    },
    cherry: {
      cherry: {
        cherry: {}
      }
    },
    date: new Date(),
  };

  return (
    <RequestBodyContainer>
      {/* Need to update this to be more specific */}
      <p className="text-sm font-semibold text-neutral-500">
        Form data
      </p>
      <JsonViewer data={data} />
    </RequestBodyContainer>
  )
}

const RequestRaw = ({ rawData }: { rawData: Uint8Array }) => {
  return (
    <RequestBodyContainer>
      <div className="text-sm text-neutral-500 whitespace-pre-wrap p-2">
        <ParseRawHTTP rawData={rawData} />
      </div>
    </RequestBodyContainer>
  )
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
          <RequestContent />
        </TabsContent>
        <TabsContent value="raw">
          <RequestRaw rawData={selectedEvent.raw_data} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
