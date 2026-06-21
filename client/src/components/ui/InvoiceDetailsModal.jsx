// src/components/ui/InvoiceDetailsModal.jsx


import { formatCurrency, formatDate } from '../../utils/format';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InvoiceDetailsModal({
    invoice,
    onClose,
}) {
    if (!invoice) return null;

    const downloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('TAX INVOICE', 14, 20);

        doc.setFontSize(11);

        doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 35);
        doc.text(`Date: ${formatDate(invoice.date)}`, 14, 42);
        doc.text(`Customer: ${invoice.party?.name || ''}`, 14, 49);

        autoTable(doc, {
            startY: 60,
            head: [['Item', 'Qty', 'Rate', 'Amount']],
            body:
                invoice.lineItems?.map((item) => [
                    item.name,
                    item.qty,
                    formatCurrency(item.rate),
                    formatCurrency(item.amount),
                ]) || [],
        });

        doc.text(
            `Grand Total : ${formatCurrency(invoice.grandTotal)}`,
            14,
            doc.lastAutoTable.finalY + 20
        );

        doc.save(`${invoice.invoiceNumber}.pdf`);
    };

    const printInvoice = () => {
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
      <html>
      <head>
        <title>${invoice.invoiceNumber}</title>
        <style>
          body{
            font-family:Arial;
            padding:20px;
          }

          table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          }

          th,td{
            border:1px solid #ddd;
            padding:8px;
          }

          h2{
            text-align:center;
          }
        </style>
      </head>
      <body>

      <h2>TAX INVOICE</h2>

      <p><b>Invoice No:</b> ${invoice.invoiceNumber}</p>
      <p><b>Date:</b> ${formatDate(invoice.date)}</p>
      <p><b>Customer:</b> ${invoice.party?.name || ''}</p>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          ${invoice.lineItems
                ?.map(
                    (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.rate}</td>
                <td>${item.amount}</td>
              </tr>
            `
                )
                .join('') || ''
            }
        </tbody>
      </table>

      <h3>
        Grand Total :
        ${formatCurrency(invoice.grandTotal)}
      </h3>

      </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.print();
    };

    const tableHead = {
        border: '1px solid #e5e7eb',
        padding: '12px',
        textAlign: 'left',
        fontWeight: '600',
    };

    const tableCell = {
        border: '1px solid #e5e7eb',
        padding: '12px',
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '20px',
            }}
        >
            <div
                style={{
                    width: '1000px',
                    maxWidth: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    background: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(0,0,0,.25)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '20px 25px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <h2 style={{ margin: 0 }}>Invoice Details</h2>

                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: '#ef4444',
                            color: '#fff',
                            width: '35px',
                            height: '35px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '18px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '25px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
                            gap: '15px',
                            marginBottom: '25px',
                        }}
                    >
                        <div>
                            <strong>Invoice No:</strong>
                            <br />
                            {invoice.invoiceNumber}
                        </div>

                        <div>
                            <strong>Date:</strong>
                            <br />
                            {formatDate(invoice.date)}
                        </div>

                        <div>
                            <strong>Customer:</strong>
                            <br />
                            {invoice.party?.name}
                        </div>

                        <div>
                            <strong>Status:</strong>
                            <br />
                            {invoice.status}
                        </div>
                    </div>

                    {/* Table */}
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: '20px',
                        }}
                    >
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={tableHead}>Item</th>
                                <th style={tableHead}>Qty</th>
                                <th style={tableHead}>Rate</th>
                                <th style={tableHead}>Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {invoice.lineItems?.map((item, i) => (
                                <tr key={i}>
                                    <td style={tableCell}>{item.name}</td>
                                    <td style={tableCell}>{item.qty}</td>
                                    <td style={tableCell}>
                                        {formatCurrency(item.rate)}
                                    </td>
                                    <td style={tableCell}>
                                        {formatCurrency(item.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '20px',
                        }}
                    >
                        <div
                            style={{
                                background: '#f8fafc',
                                padding: '15px 25px',
                                borderRadius: '12px',
                                fontSize: '20px',
                                fontWeight: '700',
                            }}
                        >
                            Grand Total :
                            <span
                                style={{
                                    color: '#2563eb',
                                    marginLeft: '10px',
                                }}
                            >
                                {formatCurrency(invoice.grandTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '20px 25px',
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                    }}
                >
                    <button
                        onClick={downloadPDF}
                        style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                        }}
                    >
                        📄 Download PDF
                    </button>

                    <button
                        onClick={printInvoice}
                        style={{
                            background: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                        }}
                    >
                        🖨️ Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}