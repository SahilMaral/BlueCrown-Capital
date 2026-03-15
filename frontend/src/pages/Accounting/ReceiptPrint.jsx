import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import './ReceiptPrint.css'; // We will create this or use inline styles

// Helper function to convert Indian Rupees Number to Words
const numberToWords = (num) => {
  if (!num) return 'Zero Rupees only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees only' : 'Rupees only';
  return str;
};

const ReceiptPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/receipts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReceipt(res.data.data);
      } catch (err) {
        console.error('Error fetching receipt for print', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt_${receipt?.receiptNumber}`,
    onAfterPrint: () => console.log('Print action finished'),
    onPrintError: (error) => console.error('Print error:', error),
  });


  const handleSendEmail = async () => {
    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL}/receipts/${id}/send-email`;
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Email sent successfully!');
    } catch (err) {
      console.error('Error sending email:', err);
      const errorMsg = err.response?.data?.message || err.message;
      alert(`Failed to send email: ${errorMsg}\n\nPlease check if backend SMTP settings in .env are correct.`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading voucher...</div>;
  }

  if (!receipt) {
    return (
      <div className="print-page-wrapper">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Receipt not found</p>
          <button className="print-btn print-btn-primary" onClick={() => navigate('/accounting/receipts')}>Back to Receipts</button>
        </div>
      </div>
    );
  }

  const payerName = receipt.payer?.clientName ? `${receipt.payer.clientName} (Client)` : (receipt.payer?.companyName || 'Unknown');
  const payerMobile = receipt.payer?.contactNo || 'N/A';
  const amountInWords = numberToWords(Math.floor(receipt.amount || 0));

  return (
    <div className="print-page-wrapper">
      <div className="voucher-container" ref={printRef}>
        <div className="voucher-border">
          {/* Header Section */}
          <div className="voucher-header">
            <div className="company-logo">
               {/* Stand-in for logo tree icon */}
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-8"></path><path d="M12 14a4 4 0 0 0-4-4H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3a4 4 0 0 0-4 4"></path></svg>
               BLUECROWN CAPITAL
            </div>
            <h2 className="company-name">{receipt.receiver?.companyName || 'BlueCrown Elite'}</h2>
            <p className="company-city">{receipt.receiver?.city || 'pune'}</p>
            <div className="voucher-title-pill">RECEIPT VOUCHER</div>
          </div>

          {/* Data Rows */}
          <div className="voucher-row">
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>RECEIPT NO:</strong> {receipt.receiptNumber}</div>
            </div>
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>DATE:</strong> {new Date(receipt.dateTime).toLocaleDateString('en-GB').replace(/\//g, '-')}</div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col-full voucher-center-header">MODE OF PAYMENT</div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>ONLINE/CASH:</strong> {receipt.paymentMode}</div>
            </div>
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>₹ {receipt.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col-full">
              <div className="voucher-label-value"><strong>AMOUNT IN WORDS:</strong> {amountInWords}</div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>FROM:</strong> {payerName}</div>
            </div>
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>MOBILE NO:</strong> {payerMobile}</div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col-full">
              <div className="voucher-label-value"><strong>NARRATION:</strong> {receipt.narration || '-'}</div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col-full">
              <div className="voucher-label-value"><strong>RECEIVED BY:</strong> {receipt.receivedBy?.name || 'admin'}</div>
            </div>
          </div>

          <div className="voucher-row disclaimer">
            <div className="voucher-col-full" style={{ textAlign: 'center' }}>
              This is a computer generated receipt. Signature not required.
            </div>
          </div>

        </div>
      </div>

      <div className="print-actions">
        <button className="print-btn print-btn-secondary" onClick={() => navigate('/accounting/receipts')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <button className="print-btn print-btn-primary" onClick={() => {
          console.log('Print button clicked');
          handlePrint();
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
          Print Voucher
        </button>
        <button 
          className="print-btn print-btn-accent" 
          onClick={handleSendEmail}
          disabled={sending}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {sending ? (
              <circle cx="12" cy="12" r="10"></circle>
            ) : (
              <><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></>
            )}
          </svg>
          {sending ? 'Sending...' : 'Email Voucher'}
        </button>
      </div>

    </div>
  );
};

export default ReceiptPrint;
