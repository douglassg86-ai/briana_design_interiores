export default async function handler(req, res) {
  // CORS configuration for the endpoint
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { RESEND_API_KEY, ADMIN_EMAIL } = process.env;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Resend API Key não configurada.' })
  }

  try {
    const { brokerName, brokerWa, clientName, clientWa, category, notes } = req.body;

    // Quando não se usa domínio próprio pago no Resend, deve-se usar um remetente oficial fornecido gratuitamente por eles: "onboarding@resend.dev".
    // Isso entregará e-mails apenas para a caixa cadastrada na conta do Resend para prevenir spam gratuito.
    
    // Configurar o destino primário:
    const destinatario = ADMIN_EMAIL || 'brianaduranti@gmail.com'; 

    const payload = {
      from: 'Briana Admin <onboarding@resend.dev>',
      to: destinatario,
      subject: `🚨 Nova Indicação de Corretor: ${brokerName || 'Desconhecido'}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #c4b8ae; border-bottom: 2px solid #e1dbd6; padding-bottom: 10px;">Nova Indicação de Projeto</h2>
          <p>Um novo cliente foi indicado através do formulário de parcerias e já se encontra salvo no CRM Admin.</p>
          
          <h3 style="color: #4a4a4a; margin-top: 25px;">Dados do Cliente</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Nome:</strong> ${clientName || 'Não informado'}</li>
            <li><strong>WhatsApp:</strong> ${clientWa || 'Não informado'}</li>
            <li><strong>Categoria Escolhida:</strong> ${category || 'Não definida'}</li>
          </ul>

          <h3 style="color: #4a4a4a; margin-top: 25px;">Dados do Parceiro / Corretor</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Nome:</strong> ${brokerName || 'Não informado'}</li>
            <li><strong>WhatsApp:</strong> ${brokerWa || 'Não informado'}</li>
          </ul>

          ${notes ? `
          <h3 style="color: #4a4a4a; margin-top: 25px;">Notas / Anexos</h3>
          <p style="background: #f9f9f9; padding: 10px; border-left: 4px solid #c4b8ae;">${notes}</p>
          ` : ''}

          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            <a href="https://briana-design-interiores.vercel.app/#admin" style="background-color: #c4b8ae; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block; font-weight: bold;">Gerenciar no Admin</a>
          </div>
        </div>
      `
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, id: data.id })
    } else {
      console.error('Erro Resend:', data);
      return res.status(500).json({ error: 'Erro ao despachar o e-mail via Resend' })
    }
  } catch (error) {
    console.error('System error:', error);
    return res.status(500).json({ error: 'Falha interna no servidor.' })
  }
}
