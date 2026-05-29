export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send('OK')
}
