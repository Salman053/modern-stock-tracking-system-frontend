import { Skeleton } from "@/components/ui/skeleton";

const TableSkeleton = ({ columns, rowsCount = 5 }:{columns?:any,rowsCount?:number}) => (
    <tbody>
      {Array.from({ length: rowsCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="hover:bg-gray-50/50">
          {columns.map((_:any, colIndex:any) => (
            <td key={colIndex} className="px-4 py-3 border-b">
              <Skeleton className="h-5 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
  export default TableSkeleton