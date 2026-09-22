// Pages Function: /api/items —— 群众端查询 D1
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const code = (url.searchParams.get("code") || "").trim();

  let stmt;
  if (code) {
    stmt = env.DB.prepare("SELECT * FROM items WHERE code = ?").bind(code);
  } else if (q) {
    const kw = `%${q}%`;
    stmt = env.DB.prepare(
      "SELECT * FROM items WHERE status='stored' AND (item_name LIKE ? OR category LIKE ? OR features LIKE ? OR found_location LIKE ?) ORDER BY id DESC"
    ).bind(kw, kw, kw, kw);
  } else {
    stmt = env.DB.prepare(
      "SELECT * FROM items WHERE status='stored' ORDER BY id DESC LIMIT 100"
    );
  }
  const rows = await stmt.all();
  return json({ items: rows.results });
}
