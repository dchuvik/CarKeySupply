# Car Key Supply

Automotive locksmith website for Car Key Supply in Elbridge, NY, serving Greater Syracuse. Built with Astro, TypeScript and Tailwind CSS, with English content and a responsive image pipeline.

## Development

Requires Node.js 22.12 or newer.

```text
npm ci
npm run dev
```

## Checks and production build

```text
npm run ai:check
npm run build
npm run check:site
npm run preview
```

`ai:check` runs type checks, import checks and unit/component tests. `check:site` checks SEO, links and image markup against the built pages. The build generates favicons, the sharing image and responsive photo formats, then strips unused image and icon output.

## Content

- `src/data/i18n/nova.json`: English homepage, navigation and footer copy.
- `src/data/global/company.json`: contact details, business information and service areas.
- `src/data/global/appointments.json`: urgency funnel, appointment questions and text messages.
- `src/content/legal/`: English privacy and cookie pages.
- `src/data/global/vehicle-makes.json`: vehicle makes matched to NHTSA identifiers.
- `public/assets/images/`: supplied photos and responsive WebP/AVIF versions.
- `design/nova.md`: design tokens; run `npm run design:sync` after editing.

See [BUSINESS-SETUP.md](BUSINESS-SETUP.md) for business details, photos, appointment texts and domain setup.

The homepage asks whether help is urgent. Urgent visitors can call or text directly. Others answer short questions about their vehicle, key and appointment before reviewing a prepared text request. The customer sends the message; the business confirms availability by reply. Shop visits are by appointment.

Vehicle year and make are selectable; models load from NHTSA vPIC for that selection. Manual entry remains available for unlisted vehicles or a failed lookup. Previous Polish URLs redirect to English pages on Netlify.

The site retains the original Nova template's [license](LICENSE.md) and WebScale attribution. Asset sources are listed in [ASSETS-LICENSES.md](ASSETS-LICENSES.md).
