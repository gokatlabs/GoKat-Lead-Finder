# GoKat Lead Finder

A dark, responsive lead discovery dashboard for GoKat Labs. Search multiple discovery sources, save verified business prospects, track website opportunities, export records to CSV, and sync leads to a Notion data source.

## What's included

- Responsive dashboard for desktop and mobile
- Discovery search shortcuts for Google Maps, LinkedIn, Instagram and web search
- Lead capture form with source/listing URL, current website, location, website gap, pipeline status and research notes
- Local browser persistence for captured leads
- Search/filter saved leads, edit pipeline status, remove leads and export CSV
- Server-side Notion sync endpoint at `/api/notion`
- Notion connection check and individual/bulk sync actions

## Run locally

This is a static HTML dashboard plus a Vercel serverless API route. Deploy the repository to Vercel to enable `/api/notion`.

For a static preview, open `index.html` in a browser. The Notion API endpoint will only work within a Vercel deployment.

## Configure Notion sync

1. Create an internal integration from [Notion integrations](https://www.notion.so/profile/integrations).
2. Give it access to the target Leads database.
3. In Vercel, add these **server-side** environment variables for the project:

   - `NOTION_TOKEN`: your Notion integration secret
   - `NOTION_DATA_SOURCE_ID`: the data source ID of the destination database

4. Redeploy the Vercel project.
5. Open the Notion Sync page inside the app and select **Test connection**.

The endpoint introspects the destination data-source properties and maps supported fields by common property names. To sync fully, configure matching Notion properties where appropriate:

- Title property: business name
- Text properties: category, location, source, website opportunity/status, pipeline status, notes
- URL properties: listing/profile URL and website URL
- Optional select property: pipeline/status (the option must already exist)

Field mapping is best-effort based on existing property names and types. No Notion secret belongs in browser code.

## Important limitation

This application does **not** scrape or bulk-import businesses automatically from Google Maps, Instagram or LinkedIn. The discovery buttons open search pages; users verify a prospect and capture it through the lead form. Automated data collection requires approved API access and must respect each source's terms and limits.

## Deployment

Use Vercel's Git integration with this repository. The root contains `index.html` and `api/notion.js`; no build step is required.

