// =====================================================
// SERVICIO DE ENVÍO DE EMAILS
// =====================================================

const nodemailer = require('nodemailer');
const pool = require('../config/database');

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verificar configuración de email
transporter.verify((error, success) => {
  if (error) {
    console.error('Error en configuración de email:', error);
  } else {
    console.log('Servidor de email listo para enviar mensajes');
  }
});

// =====================================================
// ENVIAR ORDER ACKNOWLEDGEMENT
// =====================================================
const sendOrderAcknowledgement = async (orderId) => {
  try {
    // Obtener información de la orden
    const orderResult = await pool.query(
      `SELECT 
        po.*,
        c.company_name,
        c.email as company_email,
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
        p.description
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.purchase_order_id = $1`,
      [orderId]
    );

    const items = itemsResult.rows;

    // Crear subject del email
    const subject = `Acuse de Recibo de Orden ${order.order_number} para ${order.client_id} ${order.company_name} - PO del Cliente ${order.customer_po}`;

    // Crear cuerpo del email en HTML
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">¡Gracias por su orden!</h2>
          
          <p>Adjunto encontrará nuestro Acuse de Recibo de Orden (Order Acknowledgement). Este NO es su factura, por favor NO envíe el pago con base en este documento.</p>
          
          <ul style="line-height: 1.8;">
            <li>El monto total de la orden corresponde a su pedido tal como fue ingresado y SI lo enviáramos completado al 100%</li>
            <li>La columna ENVÍO muestra lo que esperamos enviar según el inventario actual del sistema</li>
            <li>Su factura final reflejará la cantidad que realmente completamos y el cargo por flete estará incluido</li>
          </ul>
          
          <p><strong>Por favor revise todas las cantidades de la orden, artículos, precios, dirección de facturación y envío, e infórmenos de inmediato si necesitamos realizar algún cambio.</strong></p>
          
          <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Resumen de la Orden:</h3>
          <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 15px;">
            <thead>
              <tr style="background-color: #3498db; color: white;">
                <th>Artículo</th>
                <th>Descripción</th>
                <th>Cantidad Solicitada</th>
                <th>Precio Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td>${item.sku}</td>
                  <td>${item.product_name}</td>
                  <td style="text-align: center;">${item.quantity_requested}</td>
                  <td style="text-align: right;">$${item.unit_price_initial.toFixed(2)}</td>
                  <td style="text-align: right;">$${item.line_total_initial.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #ecf0f1;">
                <td colspan="4" style="text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="text-align: right; font-weight: bold;">$${order.subtotal_initial.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 25px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
            <p style="margin: 5px 0;"><strong>Número de Orden:</strong> ${order.order_number}</p>
            <p style="margin: 5px 0;"><strong>PO del Cliente:</strong> ${order.customer_po}</p>
            <p style="margin: 5px 0;"><strong>Fecha Deseada:</strong> ${order.wanted_date || 'No especificada'}</p>
            <p style="margin: 5px 0;"><strong>Fecha de Orden:</strong> ${new Date(order.created_at).toLocaleDateString('es-CR')}</p>
          </div>
          
          <p style="margin-top: 25px; color: #2c3e50;">¡Gracias por su preferencia!</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #7f8c8d; font-size: 12px;">
            <strong>Corporación Argom</strong><br>
            Este es un mensaje automático, por favor no responda directamente a este correo electrónico.
          </p>
        </body>
      </html>
    `;

    // TODO: Adjuntar PDF (implementar después)
    // const pdfBuffer = await pdfService.generateOrderAcknowledgementPDF(orderId);

    // Enviar email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: order.user_email,
      subject: subject,
      html: htmlContent,
      // attachments: [
      //   {
      //     filename: `Acuse_Orden_${order.order_number}.pdf`,
      //     content: pdfBuffer
      //   }
      // ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error enviando Order Acknowledgement:', error);
    throw error;
  }
};

// =====================================================
// ENVIAR ORDER CONFIRMATION
// =====================================================
const sendOrderConfirmation = async (orderId) => {
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
        p.description
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.purchase_order_id = $1`,
      [orderId]
    );

    const items = itemsResult.rows;

    // Crear subject del email
    const subject = `Confirmación de Orden - Orden # ${order.order_number} - PO del Cliente # ${order.customer_po}`;

    // Crear cuerpo del email en HTML
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #27ae60;">Estimado/a ${order.user_name},</h2>
          
          <p>Nos complace informarle que su orden ha sido confirmada y procesada exitosamente.</p>
          
          <p>A continuación encontrará los detalles de su orden confirmada.</p>
          
          <h3 style="color: #2c3e50; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">Detalle de la Orden:</h3>
          <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 15px;">
            <thead>
              <tr style="background-color: #27ae60; color: white;">
                <th>Línea#</th>
                <th>Artículo</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Precio Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="text-align: center;">${index + 1}</td>
                  <td>${item.sku}</td>
                  <td>${item.product_name}</td>
                  <td style="text-align: center;">${item.quantity_confirmed || item.quantity_requested}</td>
                  <td style="text-align: right;">$${(item.unit_price_confirmed || item.unit_price_initial).toFixed(2)}</td>
                  <td style="text-align: right;">$${(item.line_total_confirmed || item.line_total_initial).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #ecf0f1;">
                <td colspan="5" style="text-align: right; font-weight: bold;">Total:</td>
                <td style="text-align: right; font-weight: bold;">$${(order.subtotal_confirmed || order.subtotal_initial).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 25px; padding: 20px; background-color: #e8f8f5; border-left: 4px solid #27ae60;">
            <h4 style="margin-top: 0; color: #27ae60;">Información de la Orden:</h4>
            <table style="width: 100%; border: none;">
              <tr>
                <td style="padding: 5px 0;"><strong>Orden #:</strong></td>
                <td style="padding: 5px 0;">${order.order_number}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Fecha de Orden:</strong></td>
                <td style="padding: 5px 0;">${new Date(order.created_at).toLocaleDateString('es-CR')}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Ordenado por:</strong></td>
                <td style="padding: 5px 0;">${order.user_name}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Email:</strong></td>
                <td style="padding: 5px 0;">${order.user_email}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>PO del Cliente:</strong></td>
                <td style="padding: 5px 0;">${order.customer_po}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Fecha Deseada:</strong></td>
                <td style="padding: 5px 0;">${order.wanted_date || 'No especificada'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Teléfono:</strong></td>
                <td style="padding: 5px 0;">${order.phone || 'No especificado'}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 25px; padding: 20px; background-color: #fff9e6; border-left: 4px solid #f39c12;">
            <h4 style="margin-top: 0; color: #d68910;">Términos y Condiciones:</h4>
            <p style="font-size: 13px; line-height: 1.6; color: #555;">
              Los precios están sujetos a verificación al momento actual. 
              Este documento es una confirmación de pedido y no representa una factura final.
              Los precios y cantidades finales pueden variar según disponibilidad de inventario.
              Cualquier cambio será notificado oportunamente.
            </p>
          </div>
          
          <p style="margin-top: 30px; color: #2c3e50;">
            Agradecemos su confianza en nuestros servicios. Si tiene alguna consulta, no dude en contactarnos.
          </p>
          
          <p style="color: #27ae60; font-weight: bold;">¡Gracias por su preferencia!</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #7f8c8d; font-size: 12px;">
            <strong>Corporación Argom</strong><br>
            Este es un mensaje automático, por favor no responda directamente a este correo electrónico.
          </p>
        </body>
      </html>
    `;

    // TODO: Adjuntar PDF (implementar después)
    // const pdfBuffer = await pdfService.generateOrderConfirmationPDF(orderId);

    // Enviar email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: order.user_email,
      subject: subject,
      html: htmlContent,
      // attachments: [
      //   {
      //     filename: `Confirmacion_Orden_${order.order_number}.pdf`,
      //     content: pdfBuffer
      //   }
      // ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error enviando Order Confirmation:', error);
    throw error;
  }
};

module.exports = {
  sendOrderAcknowledgement,
  sendOrderConfirmation
};
