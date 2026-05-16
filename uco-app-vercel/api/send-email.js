export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { to, subject, html } = req.body;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "UCO Collect <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });
  const data = await r.json();
  return res.status(r.status).json(data);
}
