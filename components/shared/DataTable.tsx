import React, { useState, useMemo, useEffect, memo, useCallback } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import TableSkeleton from "./table-skeleton";
import NoDataMessage from "./no-data-message";

export interface TableColumn {
  label: string;
  key: string;
  sortable?: boolean;
  sortKey?: string;
  render?: (value: any) => any;
}

interface TableRow {
  [key: string]: any;
}

interface DataTableProps {
  loading?: boolean;
  columns: TableColumn[];
  rows: TableRow[];
  actions?: (row: TableRow) => any;
  onRowSelect?: (selectedRows: TableRow[]) => void;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  selectable?: boolean;
  pagination?: boolean;
  shouldUnselectAll?: boolean;
}
// Table Row render example for status column
const renderStatus = (status: string) => {
  const color = status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Updated TableHeader and TableRow with professional styling
const TableHeader = memo(({ columns, selectable, actions, selectedRows, paginatedRows, toggleSelectAll, sortConfig, handleSort }: any) => (
  <thead className="dark:bg-slate-800  rounded-3xl sticky top-0 z-10 text-foreground uppercase text-xs tracking-wider">
    <tr>
      {selectable && (
        <th className="px-4 py-3  rounded-3xl ">
          <Checkbox
            className="rounded-sm outline-none"
            onCheckedChange={toggleSelectAll}
            checked={selectedRows.size === paginatedRows.length && paginatedRows.length > 0}
          />
        </th>
      )}
      {columns.map((column: TableColumn) => (
        <th
          key={column.key}
          className={`px-4 py-3  text-left font-medium ${column.sortable ? "cursor-pointer select-none" : ""}`}
          onClick={() => column.sortable && handleSort(column.key)}
        >
          <div className="flex items-center gap-1">
            {column.label}
            {column.sortable && (
              <div className="flex flex-col">
                <span className={`text-[7px] ${sortConfig?.key === column.key && sortConfig.direction === "asc" ? "text-black font-bold" : "text-gray-400"}`}>▲</span>
                <span className={`text-[7px] ${sortConfig?.key === column.key && sortConfig.direction === "desc" ? "text-black font-bold" : "text-gray-400"}`}>▼</span>
              </div>
            )}
          </div>
        </th>
      ))}
      {actions && <th className="px-4 py-3 text-left font-medium">Actions</th>}
    </tr>
  </thead>
));

const TableRow = memo(({ row, rowIndex, columns, selectable, actions, selectedRows, toggleRowSelection }: any) => (
  <tr
    className={`transition-colors text-foreground duration-200 hover:dark:bg-slate-600 ${rowIndex % 2 === 0 ? "bg-background/20" : "dark:bg-slate-800"}`}
  >
    {selectable && (
      <td className="px-4 py-3 border-b">
        <Checkbox
          className="rounded-sm outline-none"
          onCheckedChange={() => toggleRowSelection(rowIndex)}
          checked={selectedRows.has(rowIndex)}
        />
      </td>
    )}
    {columns.map((column: TableColumn) => (
      <td key={column.key} className="px-4 py-3 border-b text-sm first-letter:capitalize">
        {column.render ? column.render(row[column.key]) : row[column.key]}
      </td>
    ))}
    {actions && <td className="px-4 py-3 border-b">{actions(row)}</td>}
  </tr>
));

const Pagination = memo(({ itemsPerPage, setItemsPerPage, setCurrentPage, itemsPerPageOptions, currentPage, totalPages, goToPage, goToFirstPage, goToPreviousPage, goToNextPage, goToLastPage }: any) => (
  <div className="flex flex-col md:flex-row justify-between items-center gap-2">
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Rows per page:</span>
      <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder={itemsPerPage} />
        </SelectTrigger>
        <SelectContent>
          {itemsPerPageOptions.map((option:any) => <SelectItem key={option} value={option.toString()}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center gap-1">
      <Button size="icon" variant="outline" className="rounded border-gray-200" onClick={goToFirstPage} disabled={currentPage === 1}><ChevronsLeft className="w-4 h-4" /></Button>
      <Button size="icon" variant="outline" className="rounded border-gray-200" onClick={goToPreviousPage} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          size="icon"
          variant={currentPage === page ? "default" : "outline"}
          className={`rounded border-gray-200 ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
          onClick={() => goToPage(page)}
        >
          {page}
        </Button>
      ))}
      <Button size="icon" variant="outline" className="rounded border-gray-200" onClick={goToNextPage} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
      <Button size="icon" variant="outline" className="rounded border-gray-200" onClick={goToLastPage} disabled={currentPage === totalPages}><ChevronsRight className="w-4 h-4" /></Button>
    </div>
  </div>
));

const DataTable: React.FC<DataTableProps> = memo(({
  columns=[],
  loading = false,
  rows = [],
  actions,
  pagination = true,
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
  const totalPages = useMemo(() => Math.ceil(sortedRows?.length / itemsPerPage), [sortedRows?.length, itemsPerPage]);
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

  const toggleRowSelection = useCallback((rowIndex: number) => {
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
  }, [rows, onRowSelect]);

  const toggleSelectAll = useCallback(() => {
    setSelectedRows((prev) => {
      const newSelection: Set<number> = prev.size === paginatedRows?.length ? new Set() : new Set(paginatedRows?.map((_, index) => index) ?? []);
      if (onRowSelect) {
        onRowSelect(newSelection?.size ? paginatedRows : []);
      }
      return newSelection;
    });
  }, [paginatedRows, onRowSelect]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToFirstPage = useCallback(() => goToPage(1), [goToPage]);
  const goToLastPage = useCallback(() => goToPage(totalPages), [goToPage, totalPages]);
  const goToPreviousPage = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage]);
  const goToNextPage = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage]);

  // Handle unselect all effect
  useEffect(() => {
    if (shouldUnselectAll) {
      setSelectedRows(new Set());
      if (onRowSelect) onRowSelect([]);
    }
  }, [shouldUnselectAll, onRowSelect]);

  return (
    <div className="space-y-4 overflow-x-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-[14px] text-left border-collapse table-auto">
          <TableHeader
            columns={columns}
            selectable={selectable}
            actions={actions}
            selectedRows={selectedRows}
            paginatedRows={paginatedRows}
            toggleSelectAll={toggleSelectAll}
            sortConfig={sortConfig}
            handleSort={handleSort}
          />
          {loading ? (
            <TableSkeleton columns={columns} rowsCount={5} />
          ) : paginatedRows?.length > 0 ? (
            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  row={row}
                  rowIndex={rowIndex}
                  columns={columns}
                  selectable={selectable}
                  actions={actions}
                  selectedRows={selectedRows}
                  toggleRowSelection={toggleRowSelection}
                />
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={columns.length + (selectable ? 2  : 0)}>
                  <NoDataMessage />
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      {pagination && (
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
});

DataTable.displayName = 'DataTable';

export default DataTable;