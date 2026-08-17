module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const mlResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        fields: name ? { name } : undefined,
      }),
    });

    if (!mlResponse.ok) {
      const errBody = await mlResponse.text();
      console.error('MailerLite error:', mlResponse.status, errBody);
      return res.status(502).json({ error: 'Subscription failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('MailerLite request failed:', err);
    return res.status(500).json({ error: 'Subscription failed' });
  }
};
