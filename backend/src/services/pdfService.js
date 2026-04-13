// =====================================================
// SERVICIO DE GENERACIÓN DE PDFs
// =====================================================

const PDFDocument = require('pdfkit');
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// =====================================================
// GENERAR PDF DE ORDER ACKNOWLEDGEMENT
// =====================================================
const generateOrderAcknowledgementPDF = async (orderId) => {
  try {
    // Obtener información de la orden
    const orderResult = await pool.query(
      `SELECT 
        po.*,
        c.company_name,
        c.email as company_email,
        c.phone,
        c.address,
        u.user_name,
        u.email as user_email
      FROM purchase_orders po
      INNER JOIN clients c ON po.client_id = c.id
      INNER JOIN users u ON po.user_id = u.id
      WHERE po.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('Orden no encontrada');
    }

    const order = orderResult.rows[0];

    // Obtener items de la orden
    const itemsResult = await pool.query(
      `SELECT 
        oi.*,
        p.sku,
        p.name as product_name,
        p.description,
        p.size,
        p.color
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.purchase_order_id = $1`,
      [orderId]
    );

    const items = itemsResult.rows;

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    // Capturar el PDF en memoria
    doc.on('data', buffers.push.bind(buffers));

    // Header del documento
    doc.fontSize(20)
       .text('ORDER ACKNOWLEDGEMENT', { align: 'center' })
       .moveDown();

    // Información de la empresa
    doc.fontSize(10)
       .text('Corporación Argon', { align: 'right' })
       .fontSize(8)
       .text('Costa Rica', { align: 'right' })
       .moveDown();

    // Información de la orden
    doc.fontSize(12)
       .text(`Order #: ${order.order_number}`, 50)
       .text(`Customer PO: ${order.customer_po}`)
       .text(`Order Date: ${new Date(order.created_at).toLocaleDateString()}`)
       .text(`Wanted Date: ${order.wanted_date || 'N/A'}`)
       .moveDown();

    // Información del cliente
    doc.fontSize(12)
       .text('Bill To:', { underline: true })
       .fontSize(10)
       .text(order.company_name)
       .text(order.address || '')
       .text(order.phone || '')
       .text(order.company_email)
       .moveDown();

    // Tabla de productos
    const tableTop = doc.y;
    const tableHeaders = ['Line#', 'Item', 'Description', 'Qty', 'Unit Price', 'Total'];
    const columnWidths = [40, 80, 150, 50, 80, 80];
    let currentX = 50;

    // Headers de la tabla
    doc.fontSize(10).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, currentX, tableTop, { width: columnWidths[i], align: 'left' });
      currentX += columnWidths[i];
    });

    doc.moveDown();
    let currentY = doc.y;

    // Dibujar línea debajo del header
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    // Items de la orden
    doc.font('Helvetica');
    items.forEach((item, index) => {
      currentX = 50;
      const rowData = [
        (index + 1).toString(),
        item.sku,
        item.product_name,
        item.quantity_requested.toString(),
        `$${item.unit_price_initial.toFixed(2)}`,
        `$${item.line_total_initial.toFixed(2)}`
      ];

      rowData.forEach((data, i) => {
        doc.text(data, currentX, currentY, { 
          width: columnWidths[i], 
          align: i >= 3 ? 'right' : 'left' 
        });
        currentX += columnWidths[i];
      });

      currentY += 20;

      // Nueva página si se acaba el espacio
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });

    // Línea antes del total
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    // Subtotal
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(`Subtotal: $${order.subtotal_initial.toFixed(2)}`, 400, currentY, { align: 'right' });

    currentY += 40;

    // Notas importantes
    doc.fontSize(8)
       .font('Helvetica')
       .text('IMPORTANT NOTES:', 50, currentY)
       .fontSize(7)
       .text('- This is NOT your invoice. Do not send payment based on this document.', 50, currentY + 15)
       .text('- The order total is for your order as entered IF we ship 100% completed.', 50, currentY + 25)
       .text('- Your final invoice will reflect the actual quantity filled and include freight charges.', 50, currentY + 35)
       .text('- Please review all quantities, items, pricing, and addresses immediately.', 50, currentY + 45);

    // Finalizar PDF
    doc.end();

    // Retornar el buffer cuando termine
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });

  } catch (error) {
    console.error('Error generando PDF Order Acknowledgement:', error);
    throw error;
  }
};

// =====================================================
// GENERAR PDF DE ORDER CONFIRMATION
// =====================================================
const generateOrderConfirmationPDF = async (orderId) => {
  try {
    // Obtener información de la orden
    const orderResult = await pool.query(
      `SELECT 
        po.*,
        c.company_name,
        c.email as company_email,
        c.phone,
        c.address,
        u.user_name,
        u.email as user_email
      FROM purchase_orders po
      INNER JOIN clients c ON po.client_id = c.id
      INNER JOIN users u ON po.user_id = u.id
      WHERE po.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('Orden no encontrada');
    }

    const order = orderResult.rows[0];

    // Obtener items confirmados
    const itemsResult = await pool.query(
      `SELECT 
        oi.*,
        p.sku,
        p.name as product_name,
        p.description,
        p.size,
        p.color
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.purchase_order_id = $1`,
      [orderId]
    );

    const items = itemsResult.rows;

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));

    // Header del documento
    doc.fontSize(20)
       .text('ORDER CONFIRMATION', { align: 'center' })
       .moveDown();

    // Información de la empresa
    doc.fontSize(10)
       .text('Corporación Argon', { align: 'right' })
       .fontSize(8)
       .text('Costa Rica', { align: 'right' })
       .moveDown();

    // Información de la orden
    doc.fontSize(12)
       .text(`Order #: ${order.order_number}`, 50)
       .text(`Customer PO: ${order.customer_po}`)
       .text(`Order Date: ${new Date(order.created_at).toLocaleDateString()}`)
       .text(`Confirmed Date: ${new Date(order.confirmed_at).toLocaleDateString()}`)
       .text(`Wanted Date: ${order.wanted_date || 'N/A'}`)
       .text(`Ordered By: ${order.user_name}`)
       .text(`Email: ${order.user_email}`)
       .text(`Phone: ${order.phone || 'N/A'}`)
       .moveDown();

    // Información del cliente
    doc.fontSize(12)
       .text('Bill To:', { underline: true })
       .fontSize(10)
       .text(order.company_name)
       .text(order.address || '')
       .moveDown();

    // Tabla de productos
    const tableTop = doc.y;
    const tableHeaders = ['Line#', 'Item', 'Description', 'Qty', 'Unit Price', 'Total'];
    const columnWidths = [40, 80, 150, 50, 80, 80];
    let currentX = 50;

    // Headers de la tabla
    doc.fontSize(10).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, currentX, tableTop, { width: columnWidths[i], align: 'left' });
      currentX += columnWidths[i];
    });

    doc.moveDown();
    let currentY = doc.y;

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    // Items confirmados
    doc.font('Helvetica');
    items.forEach((item, index) => {
      currentX = 50;
      const qty = item.quantity_confirmed || item.quantity_requested;
      const price = item.unit_price_confirmed || item.unit_price_initial;
      const total = item.line_total_confirmed || item.line_total_initial;

      const rowData = [
        (index + 1).toString(),
        item.sku,
        item.product_name,
        qty.toString(),
        `$${price.toFixed(2)}`,
        `$${total.toFixed(2)}`
      ];

      rowData.forEach((data, i) => {
        doc.text(data, currentX, currentY, { 
          width: columnWidths[i], 
          align: i >= 3 ? 'right' : 'left' 
        });
        currentX += columnWidths[i];
      });

      currentY += 20;

      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    // Total confirmado
    const finalTotal = order.subtotal_confirmed || order.subtotal_initial;
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(`Total: $${finalTotal.toFixed(2)}`, 400, currentY, { align: 'right' });

    currentY += 40;

    // Terms & Conditions
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('TÉRMINOS Y CONDICIONES:', 50, currentY)
       .fontSize(8)
       .font('Helvetica')
       .text('Los precios están sujetos a verificación al momento actual. Este documento es una confirmación', 50, currentY + 15)
       .text('de pedido y no representa una factura final. Los precios y cantidades finales pueden variar', 50, currentY + 25)
       .text('según disponibilidad de inventario.', 50, currentY + 35);

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });

  } catch (error) {
    console.error('Error generando PDF Order Confirmation:', error);
    throw error;
  }
};

module.exports = {
  generateOrderAcknowledgementPDF,
  generateOrderConfirmationPDF
};
