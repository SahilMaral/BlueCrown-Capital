import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import BriefcaseIcon from '../../components/icons/BriefcaseIcon';
import EliteStatusModal from '../../components/common/EliteStatusModal';
import { generatePaymentPDF } from '../../utils/reportUtils';
import './ReceiptPrint.css'; // Reuse receipt print styles

const LogoIcon = ({ className }) => (
  <svg className={className} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#0F172A"/>
    <path d="M20 10L12 15V25L20 30L28 25V15L20 10Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 18V24M16 21H24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
  </svg>
);

const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees only' : '';
  return str;
};

const PaymentPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [payment, setPayment] = useState(null);
  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayment(res.data.data);
      } catch (err) {
        console.error('Error fetching payment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Payment_${payment?.paymentNumber}`,
  });

  const handleSendEmail = async () => {
    try {
      setSending(true);
      const token = localStorage.getItem('token');
      
      const amountInWords = numberToWords(Math.floor(payment.amount || 0));
      const pdfBlob = generatePaymentPDF({ ...payment, amountInWords });
      const pdfFile = new File([pdfBlob], `Payment_${payment.paymentNumber}.pdf`, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('pdfAttachment', pdfFile);

      const url = `${import.meta.env.VITE_API_URL}/payments/${id}/send-email`;
      await axios.post(url, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setStatusModal({
        show: true,
        title: 'Success!',
        message: 'The payment voucher has been sent to the client’s email.',
        type: 'success'
      });
    } catch (err) {
      console.error('Error sending email:', err);
      setStatusModal({
        show: true,
        title: 'Sending Failed',
        message: err.response?.data?.message || 'Error sending email voucher.',
        type: 'error'
      });
    } finally {
      setSending(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!window.confirm('Are you sure you want to CANCEL this payment? This will revert all balances and mark the voucher as void.')) {
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL}/payments/${id}/cancel`;
      
      await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      setPayment({ ...payment, isCancelled: true });
      setStatusModal({
        show: true,
        title: 'Payment Cancelled',
        message: 'The payment has been successfully voided and balances have been reverted.',
        type: 'success'
      });
    } catch (err) {
      console.error('Error cancelling payment:', err);
      setStatusModal({
        show: true,
        title: 'Cancellation Failed',
        message: err.response?.data?.message || 'Error voiding payment.',
        type: 'error'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading voucher...</div>;
  if (!payment) return <div style={{ padding: '40px', textAlign: 'center' }}>Payment not found</div>;

  const receiverName = payment.receiver?.clientName || payment.receiver?.companyName || 'Unknown';
  const receiverMobile = payment.receiver?.contactNo || 'N/A';
  const amountInWords = numberToWords(Math.floor(payment.amount || 0));

  return (
    <div className="print-page-wrapper">
      <div className={`voucher-container ${payment.isCancelled ? 'cancelled-view' : ''}`} ref={printRef}>
        {payment.isCancelled && <div className="cancelled-watermark">CANCELLED</div>}
        <div className="voucher-border">
          <div className="voucher-header">
            <div className="company-logo">
               <LogoIcon className="print-logo" />
               BLUECROWN CAPITAL
            </div>
            <h2 className="company-name">{payment.payer?.companyName || 'BlueCrown Elite'}</h2>
            <p className="company-city">{payment.payer?.city || 'PUNE'}</p>
            <div className="voucher-title-pill">PAYMENT VOUCHER</div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>PAYMENT NO:</strong> {payment.paymentNumber}</div>
            </div>
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>DATE:</strong> {new Date(payment.dateTime).toLocaleDateString('en-GB').replace(/\//g, '-')}</div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col-full voucher-center-header">MODE OF PAYMENT</div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>MODE:</strong> {payment.paymentMode}</div>
            </div>
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>₹ {payment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col-full">
              <div className="voucher-label-value"><strong>AMOUNT IN WORDS:</strong> {amountInWords}</div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>TO:</strong> {receiverName}</div>
            </div>
            <div className="voucher-col">
              <div className="voucher-label-value"><strong>MOBILE NO:</strong> {receiverMobile}</div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col-full">
              <div className="voucher-label-value"><strong>NARRATION:</strong> {payment.narration || '-'}</div>
            </div>
          </div>

          <div className="voucher-row">
            <div className="voucher-col-full">
              <div className="voucher-label-value"><strong>PAID BY:</strong> {payment.paidBy?.name || 'admin'}</div>
            </div>
          </div>

          <div className="voucher-row disclaimer">
            <div className="voucher-col-full" style={{ textAlign: 'center' }}>
              This is a computer generated voucher. Signature not required.
            </div>
          </div>
        </div>
      </div>

      <div className="print-actions">
        <button className="print-btn print-btn-secondary" onClick={() => navigate('/accounting/payments')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <button className="print-btn print-btn-primary" onClick={handlePrint}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
          Print Voucher
        </button>
        <button className="print-btn print-btn-accent" onClick={handleSendEmail} disabled={sending}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
          {sending ? 'Sending...' : 'Email Voucher'}
        </button>
        {!payment.isCancelled && (
          <button className="print-btn print-btn-danger" onClick={handleCancelPayment} disabled={sending}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
            Cancel Payment
          </button>
        )}
      </div>

      <EliteStatusModal 
        isOpen={statusModal.show}
        onClose={() => setStatusModal({ ...statusModal, show: false })}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
};

export default PaymentPrint;
