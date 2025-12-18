import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
export async function printSaleReceipt(saleData: any, printType = "browser") {
  const {
    customer_id,
    sale_date,
    total_amount,
    paid_amount,
    discount,
    profit,
    note,
    is_fully_paid,
    status,
    branch_id,
    user_id,
    items,
  } = saleData;

  // Format date
  const saleDate = new Date(sale_date);
  const formattedDate = saleDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate balance
  const balance = total_amount - paid_amount;

  switch (printType) {
    case "pdf":
      generatePDFReceipt();
      break;
    case "download":
      downloadPDFReceipt();
      break;
    case "browser":
    default:
      printBrowserReceipt();
      break;
  }

  // PDF Generation Function
  function generatePDFReceipt() {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 150], // Small receipt size
    });

    let yPos = 10;
    const lineHeight = 5;
    const margin = 5;
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("STORE NAME", pageWidth / 2, yPos, { align: "center" });
    yPos += lineHeight;

    pdf.setDrawColor(0);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += lineHeight;

    // Sale Info
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Receipt #: ${saleData.id || "N/A"}`, margin, yPos);
    yPos += lineHeight;
    pdf.text(`Date: ${formattedDate}`, margin, yPos);
    yPos += lineHeight;
    pdf.text(`Customer: ${customer_id || "Walk-in"}`, margin, yPos);
    yPos += lineHeight;

    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += lineHeight;

    // Items Table
    const colPositions = {
      item: margin,
      qty: 40,
      price: 50,
      total: 65,
    };

    // Table Header
    pdf.setFont("helvetica", "bold");
    pdf.text("Item", colPositions.item, yPos);
    pdf.text("Qty", colPositions.qty, yPos);
    pdf.text("Price", colPositions.price, yPos);
    pdf.text("Total", colPositions.total, yPos);
    yPos += lineHeight;

    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += lineHeight;

    // Items
    pdf.setFont("helvetica", "normal");
    items.forEach((item: any) => {
      const itemTotal = item.quantity * item.unit_price;

      pdf.text(
        String(item.product_id).substring(0, 12),
        colPositions.item,
        yPos
      );
      pdf.text(item.quantity.toString(), colPositions.qty, yPos);
      pdf.text(`Rs.${item.unit_price.toFixed(2)}`, colPositions.price, yPos);
      pdf.text(`Rs.${itemTotal.toFixed(2)}`, colPositions.total, yPos);
      yPos += lineHeight;
    });

    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += lineHeight;

    // Totals
    pdf.setFont("helvetica", "bold");
    pdf.text("TOTALS:", margin, yPos);
    yPos += lineHeight;

    pdf.setFont("helvetica", "normal");
    pdf.text(`Subtotal:`, margin, yPos);
    pdf.text(`Rs.${total_amount.toFixed(2)}`, colPositions.total, yPos, {
      align: "right",
    });
    yPos += lineHeight;

    pdf.text(`Discount:`, margin, yPos);
    pdf.text(`-Rs.${discount.toFixed(2)}`, colPositions.total, yPos, {
      align: "right",
    });
    yPos += lineHeight;

    pdf.text(`Paid:`, margin, yPos);
    pdf.text(`Rs.${paid_amount.toFixed(2)}`, colPositions.total, yPos, {
      align: "right",
    });
    yPos += lineHeight;

    pdf.text(`Balance:`, margin, yPos);
    pdf.text(`Rs.${balance.toFixed(2)}`, colPositions.total, yPos, {
      align: "right",
    });
    yPos += lineHeight;

    // Footer
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += lineHeight;

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "italic");
    pdf.text("Thank you for your purchase!", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += lineHeight;
    pdf.text("Returns within 7 days with receipt", pageWidth / 2, yPos, {
      align: "center",
    });

    return pdf;
  }

  // Download PDF Function
  function downloadPDFReceipt() {
    const pdf = generatePDFReceipt();
    pdf.save(`receipt-${saleData.id || Date.now()}.pdf`);
  }

  // Browser Print Function
  function printBrowserReceipt() {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast.error("Please allow popups to print receipts");
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${saleData.id || "N/A"}</title>
        <style>
          @media print {
            @page { 
              size: 80mm 150mm;
              margin: 2mm;
            }
            body { 
              width: 76mm;
              font-family: 'Courier New', monospace;
              font-size: 10px;
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 76mm;
            margin: 0 auto;
            padding: 5px;
          }
          .header {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .line {
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 2px;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .text-bold {
            font-weight: bold;
          }
          .totals {
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            font-size: 9px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">STORE NAME</div>
        <div class="line"></div>
        
        <div>Receipt #: ${saleData.id || "N/A"}</div>
        <div>Date: ${formattedDate}</div>
        <div>Customer: ${customer_id || "Walk-in"}</div>
        <div>Staff: ${user_id || "N/A"}</div>
        
        <div class="line"></div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item: any) => `
              <tr>
                <td>${String(item.product_id).substring(0, 15)}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">Rs.${item.unit_price.toFixed(2)}</td>
                <td class="text-right">Rs.${(
                  item.quantity * item.unit_price
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="line"></div>
        
        <div class="totals">
          <div>Subtotal: <span class="text-right">Rs.${total_amount.toFixed(
            2
          )}</span></div>
          <div>Discount: <span class="text-right">-Rs.${discount.toFixed(
            2
          )}</span></div>
          <div>Paid: <span class="text-right">Rs.${paid_amount.toFixed(
            2
          )}</span></div>
          <div class="text-bold">Balance: <span class="text-right">Rs.${balance.toFixed(
            2
          )}</span></div>
        </div>
        
        <div class="line"></div>
        
        <div>Payment: ${is_fully_paid ? "FULLY PAID" : "PARTIAL PAYMENT"}</div>
        <div>Status: ${status.toUpperCase()}</div>
        
        ${
          note
            ? `<div class="line"></div><div><strong>Note:</strong> ${note}</div>`
            : ""
        }
        
        <div class="footer">
          <div>Thank you for your purchase!</div>
          <div>Returns within 7 days with receipt</div>
        </div>
        
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 1000);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  }
}

// Utility function to print from HTML element
export async function printFromHTML(elementId: string, options = {}) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Element not found");
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    ...options,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 150],
  });

  const imgWidth = 70;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);

  return pdf;
}

// React Component for Receipt Display
export function ReceiptDisplay({ saleData }: { saleData: any }) {
  return (
    <div
      id="receipt-print"
      style={{
        width: "76mm",
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        padding: "10px",
        border: "1px solid #ccc",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "14px",
          marginBottom: "10px",
        }}
      >
        STORE NAME
      </div>
      <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

      <div>Receipt #: {saleData.id || "N/A"}</div>
      <div>Date: {new Date(saleData.sale_date).toLocaleString()}</div>
      <div>Customer: {saleData.customer_id || "Walk-in"}</div>
      <div>Staff: {saleData.user_id || "N/A"}</div>

      <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Item</th>
            <th style={{ textAlign: "center" }}>Qty</th>
            <th style={{ textAlign: "right" }}>Price</th>
            <th style={{ textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {saleData.items.map((item: any, index: number) => (
            <tr key={index}>
              <td>{String(item.product_id).substring(0, 15)}</td>
              <td style={{ textAlign: "center" }}>{item.quantity}</td>
              <td style={{ textAlign: "right" }}>
                Rs.{item.unit_price.toFixed(2)}
              </td>
              <td style={{ textAlign: "right" }}>
                Rs.{(item.quantity * item.unit_price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

      <div style={{ marginTop: "10px" }}>
        <div>
          Subtotal:{" "}
          <span style={{ float: "right" }}>
            Rs.{saleData.total_amount.toFixed(2)}
          </span>
        </div>
        <div>
          Discount:{" "}
          <span style={{ float: "right" }}>
            -Rs.{saleData.discount.toFixed(2)}
          </span>
        </div>
        <div>
          Paid:{" "}
          <span style={{ float: "right" }}>
            Rs.{saleData.paid_amount.toFixed(2)}
          </span>
        </div>
        <div style={{ fontWeight: "bold" }}>
          Balance:{" "}
          <span style={{ float: "right" }}>
            Rs.{(saleData.total_amount - saleData.paid_amount).toFixed(2)}
          </span>
        </div>
      </div>

      <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />

      <div>
        Payment: {saleData.is_fully_paid ? "FULLY PAID" : "PARTIAL PAYMENT"}
      </div>
      <div>Status: {saleData.status.toUpperCase()}</div>

      {saleData.note && (
        <>
          <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
          <div>
            <strong>Note:</strong> {saleData.note}
          </div>
        </>
      )}

      <div style={{ textAlign: "center", fontSize: "9px", marginTop: "20px" }}>
        <div>Thank you for your purchase!</div>
        <div>Returns within 7 days with receipt</div>
      </div>
    </div>
  );
}
