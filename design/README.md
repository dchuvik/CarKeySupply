# Car Key Supply design tokens

`nova.md` defines the site's color, spacing, radius, typography and animation tokens. The existing `nova` identifier is retained in selectors for compatibility with the original design.

After changing the tokens, run:

```text
npm run design:sync
```

This updates `src/styles/themes.css` and `src/styles/tailwind-theme.css`. Keep these generated styles in the repository so builds remain reproducible.
