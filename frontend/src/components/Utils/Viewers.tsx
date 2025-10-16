import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";

export const TableViewer = ({ data }: { data: Record<string, string> }) => {
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
