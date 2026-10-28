# Car Key Supply setup

Car Key Supply is an automotive locksmith in Elbridge, NY, serving Greater Syracuse and Central New York. The site is English-only.

## Business details

Edit `src/data/global/company.json`. The phone and appointment text recipient is `315-552-1553`. The shop is at **598 State Route 5, Elbridge, NY 13060** and the email is **carkeysupplycny@gmail.com**. Visits are **by appointment**; the site does not advertise fixed business hours.

Homepage, navigation and footer copy live in `src/data/i18n/nova.json`. The homepage follows this order: request funnel, services, keys and fobs, how it works, shop map, service area, FAQs, and contact footer. The menu follows those sections.

## Appointment requests

The homepage starts by asking whether help is urgent. Urgent visitors get immediate call and text links. Non-urgent visitors move through vehicle year/make/model, working-key status and service, contact details, and a review step. Preferred date/time and notes are optional. The existing appointment buttons open the same funnel in an accessible dialog.

Continuing from the review opens the customer's texting app with a prepared request to the phone in `company.json`. They review it and tap Send. The business confirms availability by reply. The urgent path does not require a form.

The form does not submit to a website endpoint or save details in browser storage. A message preview and copy option support desktop visitors and devices without SMS support. Form and funnel copy live in `src/data/global/appointments.json`; shared behavior lives in `src/utils/key-request-funnel.ts`.

Vehicle years and makes use dropdowns. The make list in `src/data/global/vehicle-makes.json` uses NHTSA vPIC identifiers. Models load from `https://vpic.nhtsa.dot.gov/api/` for the selected year and make; only those two vehicle details are sent. Lookups time out after ten seconds, cache results in memory, and support manual entry for unlisted vehicles or failed lookups. Changing the year or make resets the model and cancels the previous lookup. Scion uses manual model entry because the current make catalog does not list a separate identifier.

## Shop map and directions

The about section includes a lazy-loaded Google Map, the shop photo and a directions button. Both map and directions use the address in `company.json`; the directions link lets visitors choose their starting point in Google Maps. Location-card copy lives in `src/data/global/shop-location.json`. No API key or additional package is needed. The site's content security policy permits the Google Maps frame, and the privacy/cookie pages describe this external content.

## Photos

| Placement | Source file |
| --- | --- |
| Header logo | `public/assets/images/logo.jpeg` |
| Hero and shop section | `public/assets/images/shop.webp` (supplied WebP original) |
| Spare-key card | `public/assets/images/two-key-fobs.png` |
| Programming card | `public/assets/images/right-car-keys.png` |

PNG, JPEG and standalone WebP photos in `public/assets/images/` generate responsive WebP and AVIF versions during `npm run assets:img` or `npm run build`. Use lowercase filenames with hyphens. Keep the original path in the content; `SmartImage` supplies the generated variants. For WebP originals, the standard derivative uses `@800` so the supplied file is preserved. Both key cards use a centered cover crop on mobile and desktop.

When replacing a photo, use a new filename and update its path and descriptive alternative text. The footer uses a plain dark background. There are no remaining template stock photos.

`public/icon.svg` is the source for favicon assets. `public/og-image.svg` is the source for the Car Key Supply sharing card. `npm run assets:gen` regenerates them when their sources change.

## Public domain and indexing

Set `PUBLIC_SITE_URL` to the production domain before building. It controls canonical URLs, the sitemap and structured business data. Without a domain the site uses localhost and stays noindex. Deployment previews stay noindex.

```powershell
$env:PUBLIC_SITE_URL = 'https://your-real-domain.com/'
npm run build
```

Copy `.env.example` to `.env` to save local settings. `PUBLIC_BASE_PATH` is optional for hosting below a domain subdirectory.

## Validation

```text
npm run ai:check
npm run build
npm run check:site
```

The original template license and footer attribution are retained.
