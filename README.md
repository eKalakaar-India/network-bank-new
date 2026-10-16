# Network Bank

A contact directory backed by Google Sheets.

## Run locally

1. Install dependencies with `npm install`.
2. Set these values in `.env`:

   ```dotenv
   SHEET_ID=your_spreadsheet_id
   SHEET_RANGE=Sheet1
   ```

   `SHEET_RANGE` is the sheet tab name or A1 range to read. Enable the Google
   Sheets API is not required. The spreadsheet must be shared so anyone with
   the link can view it; private spreadsheets require authenticated access,
   which this app does not currently implement.
3. Restart the development server after changing `.env`, then run `npm run dev`.

The Vite development server runs the app's `/api/cards` and `/api/facets`
handlers locally. Do not commit `.env`.

## Deploy

Configure `SHEET_ID` and (optionally) `SHEET_RANGE` as environment variables
in the deployment environment. The `/api` handlers are deployed as serverless
functions.
