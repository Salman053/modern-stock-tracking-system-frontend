import React, { useState, useMemo, useEffect, memo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import TableSkeleton from "./table-skeleton";
import NoDataMessage from "./no-data-message";

export interface TableColumn {
  label: string;
  key: string;
  sortable?: boolean;
  sortKey?: string;
  render?: (value: any) => React.ReactNode;
}

interface TableRowData {
  [key: string]: any;
}

interface DataTableProps {
  loading?: boolean;
  columns: TableColumn[];
  rows: TableRowData[];
  actions?: (row: TableRowData) => React.ReactNode;
  onRowSelect?: (selectedRows: TableRowData[]) => void;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  selectable?: boolean;
  pagination?: boolean;
  shouldUnselectAll?: boolean;
}

// Example render function for status column (you can keep this or remove)
const renderStatus = (status: string) => {
  const color =
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Updated TableHeaderRow component with shadcn TableHead
const TableHeaderRow = memo(
  ({
    columns,
    selectable,
    actions,
    selectedRows,
    paginatedRows,
    toggleSelectAll,
    sortConfig,
    handleSort,
  }: any) => (
    <>
      {selectable && (
        <TableHead className="w-[50px]">
          <Checkbox
            className="rounded-sm outline-none"
            onCheckedChange={toggleSelectAll}
            checked={
              selectedRows.size === paginatedRows.length &&
              paginatedRows.length > 0
            }
          />
        </TableHead>
      )}
      {columns.map((column: TableColumn) => (
        <TableHead
          key={column.key}
          className={` py-3   text-white ${
            column.sortable ? "cursor-pointer select-none" : ""
          }`}
          onClick={() => column.sortable && handleSort(column.key)}
        >
          <div className="flex items-center gap-1">
            {column.label}
            {column.sortable && (
              <div className="flex flex-col">
                <span
                  className={`text-[7px] ${
                    sortConfig?.key === column.key &&
                    sortConfig.direction === "asc"
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  ▲
                </span>
                <span
                  className={`text-[7px] ${
                    sortConfig?.key === column.key &&
                    sortConfig.direction === "desc"
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  ▼
                </span>
              </div>
            )}
          </div>
        </TableHead>
      ))}
      {actions && <TableHead className="text-white">Actions</TableHead>}
    </>
  )
);

// Updated TableRow component with shadcn TableRow and TableCell
const DataTableRow = memo(
  ({
    row,
    rowIndex,
    columns,
    selectable,
    actions,
    selectedRows,
    toggleRowSelection,
  }: any) => (
    <TableRow
      className={selectedRows.has(rowIndex) ? "bg-muted/50" : undefined}
    >
      {selectable && (
        <TableCell>
          <Checkbox
            className="rounded-sm outline-none"
            onCheckedChange={() => toggleRowSelection(rowIndex)}
            checked={selectedRows.has(rowIndex)}
          />
        </TableCell>
      )}
      {columns.map((column: TableColumn) => (
        <TableCell key={column.key} className="first-letter:capitalize">
          {column.render ? column.render(row[column.key]) : row[column.key]}
        </TableCell>
      ))}
      {actions && <TableCell className="">{actions(row)}</TableCell>}
    </TableRow>
  )
);

// Pagination component remains similar but uses shadcn styling
const Pagination = memo(
  ({
    itemsPerPage,
    setItemsPerPage,
    setCurrentPage,
    itemsPerPageOptions,
    currentPage,
    totalPages,
    goToPage,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
  }: any) => (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page:</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder={itemsPerPage} />
          </SelectTrigger>
          <SelectContent>
            {itemsPerPageOptions.map((option: any) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={goToFirstPage}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            if (pageNum > totalPages || pageNum < 1) return null;

            return (
              <Button
                key={pageNum}
                size="icon"
                variant={currentPage === pageNum ? "default" : "outline"}
                className={`h-8 w-8 ${
                  currentPage === pageNum
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => goToPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
);

const DataTable: React.FC<DataTableProps> = memo(
  ({
    columns = [],
    loading = false,
    rows = [],
    actions,
    pagination = false,
    selectable = true,
    onRowSelect,
    itemsPerPageOptions = [10, 20, 30, 50],
    defaultItemsPerPage = 10,
    shouldUnselectAll = false,
  }) => {
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig] = useState<{
      key: string;
      direction: "asc" | "desc";
    } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

    // Memoized sorting logic
    const sortedRows = useMemo(() => {
      if (!sortConfig) return rows;
      const { key, direction } = sortConfig;
      return [...rows].sort((a, b) => {
        const column = columns.find((col) => col.key === key);
        const sortKey = column?.sortKey || key;
        let aValue = a[sortKey];
        let bValue = b[sortKey];
        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        if (aValue > bValue) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }, [rows, sortConfig, columns]);

    // Memoized pagination calculations
    const totalPages = useMemo(
      () => Math.ceil(sortedRows?.length / itemsPerPage),
      [sortedRows?.length, itemsPerPage]
    );
    const paginatedRows = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return sortedRows?.slice(start, end);
    }, [sortedRows, currentPage, itemsPerPage]);

    // Memoized handlers
    const handleSort = useCallback((key: string) => {
      setSortConfig((prev) => {
        if (prev?.key === key && prev?.direction === "asc") {
          return { key, direction: "desc" };
        }
        return { key, direction: "asc" };
      });
    }, []);

    const toggleRowSelection = useCallback(
      (rowIndex: number) => {
        setSelectedRows((prev) => {
          const updated = new Set(prev);
          if (updated.has(rowIndex)) {
            updated.delete(rowIndex);
          } else {
            updated.add(rowIndex);
          }
          const selected = [...updated]?.map((index) => rows[index]);
          if (onRowSelect) onRowSelect(selected);
          return updated;
        });
      },
      [rows, onRowSelect]
    );

    const toggleSelectAll = useCallback(() => {
      setSelectedRows((prev) => {
        const newSelection: Set<number> =
          prev.size === paginatedRows?.length
            ? new Set()
            : new Set(paginatedRows?.map((_, index) => index) ?? []);
        if (onRowSelect) {
          onRowSelect(newSelection?.size ? paginatedRows : []);
        }
        return newSelection;
      });
    }, [paginatedRows, onRowSelect]);

    const goToPage = useCallback(
      (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
      },
      [totalPages]
    );

    const goToFirstPage = useCallback(() => goToPage(1), [goToPage]);
    const goToLastPage = useCallback(
      () => goToPage(totalPages),
      [goToPage, totalPages]
    );
    const goToPreviousPage = useCallback(
      () => goToPage(currentPage - 1),
      [goToPage, currentPage]
    );
    const goToNextPage = useCallback(
      () => goToPage(currentPage + 1),
      [goToPage, currentPage]
    );

    // Handle unselect all effect
    useEffect(() => {
      if (shouldUnselectAll) {
        setSelectedRows(new Set());
        if (onRowSelect) onRowSelect([]);
      }
    }, [shouldUnselectAll, onRowSelect]);

    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
      if (loading) {
        const timer = setTimeout(() => {
          setShowLoading(true);
        }, 300);

        return () => clearTimeout(timer);
      } else {
        setShowLoading(false);
      }
    }, [loading]);

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader className=" bg-primary text-foreground">
              <TableRow className="">
                <TableHeaderRow
                  columns={columns}
                  selectable={selectable}
                  actions={actions}
                  selectedRows={selectedRows}
                  paginatedRows={paginatedRows}
                  toggleSelectAll={toggleSelectAll}
                  sortConfig={sortConfig}
                  handleSort={handleSort}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {showLoading ? (
                <TableSkeleton columns={columns} rowsCount={5} />
              ) : paginatedRows?.length > 0 ? (
                paginatedRows.map((row, rowIndex) => (
                  <DataTableRow
                    key={rowIndex}
                    row={row}
                    rowIndex={rowIndex}
                    columns={columns}
                    selectable={selectable}
                    actions={actions}
                    selectedRows={selectedRows}
                    toggleRowSelection={toggleRowSelection}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                    }
                    className="h-24 text-center"
                  >
                    <NoDataMessage />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {pagination && rows.length > 0 && (
          <Pagination
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            setCurrentPage={setCurrentPage}
            itemsPerPageOptions={itemsPerPageOptions}
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            goToFirstPage={goToFirstPage}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            goToLastPage={goToLastPage}
          />
        )}
      </div>
    );
  }
);

DataTable.displayName = "DataTable";

export default DataTable;
