export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  if (!token || !dataSourceId) return res.status(503).json({ error: "Notion is not configured. Add NOTION_TOKEN and NOTION_DATA_SOURCE_ID in Vercel environment variables." });
  const headers = { Authorization: "Bearer " + token, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };
  try {
    const schemaResponse = await fetch("https://api.notion.com/v1/data_sources/" + dataSourceId, { headers });
    const schema = await schemaResponse.json();
    if (!schemaResponse.ok) return res.status(schemaResponse.status).json({ error: schema.message || "Cannot access Notion data source." });
    if (req.method === "GET") return res.status(200).json({ message: "Connected to " + ((schema.title || []).map(t => t.plain_text).join("") || "your Notion data source") });
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const lead = req.body && req.body.lead;
    if (!lead || !lead.name || !lead.listing) return res.status(400).json({ error: "Business name and listing URL are required." });
    const properties = schema.properties || {};
    const titleKey = Object.keys(properties).find(key => properties[key].type === "title");
    if (!titleKey) return res.status(400).json({ error: "No title property found in the destination database." });
    const pageProperties = {};
    pageProperties[titleKey] = { title: [{ text: { content: String(lead.name).slice(0, 2000) } }] };
    const addText = (names, value) => {
      if (!value) return;
      const key = Object.keys(properties).find(name => names.includes(name.toLowerCase()) && properties[name].type === "rich_text");
      if (key) pageProperties[key] = { rich_text: [{ text: { content: String(value).slice(0, 2000) } }] };
    };
    const addUrl = (names, value) => {
      if (!value) return;
      const key = Object.keys(properties).find(name => names.includes(name.toLowerCase()) && properties[name].type === "url");
      if (key) pageProperties[key] = { url: value };
    };
    const addSelect = (names, value) => {
      if (!value) return;
      const key = Object.keys(properties).find(name => names.includes(name.toLowerCase()) && properties[name].type === "select");
      if (key && (properties[key].select.options || []).some(option => option.name === value)) pageProperties[key] = { select: { name: value } };
    };
    addText(["category", "business type", "industry"], lead.category);
    addText(["location", "city", "area"], lead.location);
    addText(["source", "platform", "lead source"], lead.source);
    addText(["website status", "website opportunity", "opportunity"], lead.status);
    addText(["pipeline", "status", "lead status"], lead.pipeline);
    addText(["notes", "description", "research notes"], lead.notes);
    addUrl(["website", "website link", "current website"], lead.website);
    addUrl(["listing", "listing link", "source link", "profile link", "google listing"], lead.listing);
    addSelect(["pipeline", "status", "lead status"], lead.pipeline);
    const createResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers,
      body: JSON.stringify({ parent: { type: "data_source_id", data_source_id: dataSourceId }, properties: pageProperties })
    });
    const result = await createResponse.json();
    if (!createResponse.ok) return res.status(createResponse.status).json({ error: result.message || "Notion could not create the page. Check database permissions and property types." });
    return res.status(200).json({ ok: true, url: result.url });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected Notion sync error." });
  }
}