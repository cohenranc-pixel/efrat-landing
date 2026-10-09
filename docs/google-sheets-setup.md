# Direct Google Sheets contact form

The browser submits to `/api/contact`. The server authenticates with a Google service account, verifies the existing sheet headers, and appends one row. No n8n webhook is used by this branch. No new spreadsheet is created.

## One-time setup

1. In a Google Cloud project, enable the Google Sheets API. Create a dedicated service account and a JSON key. No project-wide IAM role or domain-wide delegation is needed.
2. Share the existing lead spreadsheet with the service account's `client_email` as Editor. Do not make the spreadsheet public.
3. In the existing Vercel `efrat-landing` project's Settings → Environment Variables, configure:

| Variable | Value |
| --- | --- |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ID of the existing lead spreadsheet supplied by the owner |
| `GOOGLE_SHEETS_TAB_NAME` | `Rev1.1` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the service account JSON |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | `private_key` from that JSON; actual newlines or literal `\n` are supported |

Store the key as a secret in Vercel. Never commit the JSON key, put it in a `NEXT_PUBLIC_` variable, or paste it into a pull request. Use a separate test spreadsheet for Preview if you want to avoid test rows in the lead sheet; it must have the same headers. Configure the appropriate Production and Preview targets before deploying.

Expected A1:J1 headers, in order:

`ReceivedAtDate, ReceivedAtTime, parentName, phone, grade, subject, message, source, ip, ua`

Rows use Jerusalem date/time. Phone numbers and user text are appended with `valueInputOption=RAW`, preserving leading zeroes and preventing text beginning with `=` from becoming a formula. The `source` value is `efrat-landing`; IP is taken only from Vercel's forwarding header and is blank outside Vercel.

## Cutover verification

1. Run `node --experimental-strip-types --test tests/contact.test.mjs` (Node 22.18+ or 24).
2. Deploy the configured branch to Preview. Send one clearly marked test lead and check that exactly one new row appears with the right columns, leading zero in the phone, and Jerusalem time. Confirm the success message appears only after the sheet write.
3. Test an upstream failure in Preview: the form must show the error, keep entered details, and re-enable the submit button.
4. Merge to the production branch only after credentials and Preview verification are complete. Verify one marked production test lead, then remove only the marked test rows.
5. After production verification, remove `NEXT_PUBLIC_N8N_WEBHOOK_URL` from this project's environments and disable only the n8n workflow dedicated to this website. Do not disable unrelated workflows.

The mock tests do not replace live credentials or a real end-to-end test. Client-side locking prevents double clicks while a submission is in flight. There are no automatic retries: an interrupted response after a successful Google append can leave an uncertain result, so the error asks the visitor to call rather than silently resubmit. This is not durable exactly-once delivery. Origin checks do not replace bot detection or platform rate limits for a public form.

References: https://developers.google.com/identity/protocols/oauth2/service-account and https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append
