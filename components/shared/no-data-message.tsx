const NoDataMessage = ({
  message = "Try adjusting filters or adding new records.",
}: {
  message?: string;
}) => (
  <div className="flex w-full flex-col items-center justify-center py-10 text-center text-gray-500">
    <span className="text-lg font-medium">No Data Available</span>
    <p className="text-sm">{message}</p>
  </div>
);
export default NoDataMessage;
