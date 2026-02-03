const PDFDocument = require('pdfkit');
const getStream = require('get-stream');

async function generatePayslipPDF(payroll){
  const doc = new PDFDocument();
  doc.fontSize(18).text('Payslip', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Employee ID: ${payroll.employee}`);
  doc.text(`Period: ${new Date(payroll.periodStart).toDateString()} - ${new Date(payroll.periodEnd).toDateString()}`);
  doc.moveDown();
  doc.text(`Basic: ${payroll.basic}`);
  doc.text(`Overtime: ${payroll.overtime}`);
  doc.text(`Gross Pay: ${payroll.grossPay}`);
  doc.text(`Deductions: ${JSON.stringify(payroll.deductions)}`);
  doc.text(`Contributions: ${JSON.stringify(payroll.contributions)}`);
  doc.moveDown();
  doc.fontSize(14).text(`Net Pay: ${payroll.netPay}`, { align: 'right' });
  doc.end();
  return getStream.buffer(doc);
}

module.exports = { generatePayslipPDF };
