# Car Key Supply design

Keep the existing mobile layouts, centered card crops and existing brand accent. Use the tokens in `design/nova.md`, `src/styles/themes.css` and `src/styles/tailwind-theme.css`.

- Use the self-hosted Satoshi font through `--font-sans` and `--font-heading`.
- Build sections with `Section.astro` and `Container.astro`; use the existing heading, text and button atoms.
- Let parent layouts control spacing. Keep generous spacing and readable text on small screens.
- Use the existing button text swap and shared card hover behavior. Respect reduced motion.
- Use local responsive AVIF/WebP photos through `SmartImage.astro`.
- Use import aliases and trailing slashes on internal page links.
- Keep the site English-only and preserve appointment dialog accessibility.

After token changes, run `npm run design:sync`. Validate code with `npm run ai:check`; build and run `npm run check:site` before delivery. Check affected layouts in a browser at phone and desktop widths.
