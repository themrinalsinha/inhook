import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { RequestBodyContainer } from "@/components/Dashboard/RequestBodyContainer"
import { JsonViewer } from "../JsonViewer/JsonViewer";

const RequestHeader = () => {
  return (
    <RequestBodyContainer>
      <Table className="w-full text-sm text-neutral-700">
        <TableBody>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Accept-Language</TableHead>
            <TableCell className="w-2/3">
              fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Host</TableHead>
            <TableCell className="w-2/3">www.example.com</TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Accept</TableHead>
            <TableCell className="w-2/3">application/json</TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Accept-Language</TableHead>
            <TableCell className="w-2/3">
              fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Host</TableHead>
            <TableCell className="w-2/3">www.example.com</TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Accept</TableHead>
            <TableCell className="w-2/3">application/json</TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Accept-Language</TableHead>
            <TableCell className="w-2/3">
              fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Host</TableHead>
            <TableCell className="w-2/3">www.example.com</TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Accept</TableHead>
            <TableCell className="w-2/3">application/json</TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">Accept-Language</TableHead>
            <TableCell className="w-2/3">
              fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">
              Cross-Origin-Embedder-Policy
            </TableHead>
            <TableCell className="w-2/3">unsafe-none</TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">X-AIRBASE-APP-VERSION</TableHead>
            <TableCell className="w-2/3">1.0.0</TableCell>
          </TableRow>
          <TableRow className="hover:bg-neutral-50">
            <TableHead className="w-1/3">
              X-AIRBASE-SHCDN-TOKEN-X-AIRBASE-SHCDN-TOKEN
            </TableHead>
            <TableCell className="w-2/3">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Temporibus, velit? Ex, iusto? A reprehenderit consequuntur
              perferendis unde mollitia. Nobis nam accusamus velit quasi nulla
              distinctio magni enim molestiae esse nihil.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </RequestBodyContainer>
  );
}

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
  };

  return (
    <RequestBodyContainer>
      <JsonViewer data={data} />
    </RequestBodyContainer>
  )
}

const RequestRaw = () => {
  return (
    <RequestBodyContainer>
      <p>Raw</p>
    </RequestBodyContainer>
  )
}

export const RequestDetailBody = () => {
  return (
    <div>
      <p className="text-md font-semibold text-neutral-500 mt-5 mb-2">
        Request Preview
      </p>
      <Tabs defaultValue="header">
        <TabsList className="w-full">
          <TabsTrigger value="header" className="text-neutral-700">Header</TabsTrigger>
          <TabsTrigger value="content" className="text-neutral-700">Content</TabsTrigger>
          <TabsTrigger value="raw" className="text-neutral-700">Raw</TabsTrigger>
        </TabsList>
        <TabsContent value="header">
          <RequestHeader />
        </TabsContent>
        <TabsContent value="content">
          <RequestContent />
        </TabsContent>
        <TabsContent value="raw">
          <RequestRaw />
        </TabsContent>
      </Tabs>
    </div>
  )
}
