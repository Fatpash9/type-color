# Chrome Web Store submission sheet

Everything the developer dashboard asks for, in the order it asks.
Dashboard: https://chrome.google.com/webstore/devconsole

## Package

Upload `type-color-<version>.zip` from the project root (built with
`npm run package`). If a version is already published or in review,
bump `version` in package.json first; the store rejects a repeat.

## Store listing tab

**Description** (detailed):

```
Type Color recolors letters and digits on web pages according to a
palette you configure. Each glyph — 0 through 9 and A through Z — gets
its own color.

This is built primarily for grapheme-color synesthetes: people who
perceive specific colors when they see letters and numbers. Type Color
lets you bring your internal palette onto the screen.

Features
- 36 editable color slots, one per glyph
- Changes apply to open tabs immediately, no reload
- Per-site toggle to turn recoloring off on any domain
- Export and import your palette as JSON

Privacy
The extension reads page text locally to recolor it and stores your
palette in Chrome's built-in sync storage. Nothing is sent to any
server. No tracking, no analytics, no third parties.

Type Color is free. If it helps you, you can support it at
buymeacoffee.com/typecolor.
```

**Category:** Accessibility
**Language:** English

**Graphic assets:**
- Store icon (128×128): `public/icons/icon-128.png`
- Screenshot (1280×800): `store-assets/screenshot-1.png`
- Small promo tile (440×280): `store-assets/promo-small-440x280.png`
- Marquee promo tile: leave empty (optional)

**Additional fields:**
- Official URL: leave as "None"
- Homepage URL: https://github.com/Fatpash9/type-color
- Support URL: https://github.com/Fatpash9/type-color/issues

The short description (summary) comes from the manifest automatically:
"Recolor letters and digits in your chosen palette."

## Privacy practices tab

**Single purpose description:**

```
Recolor letters and digits on web pages according to a user-configured palette.
```

**Permission justifications:**

storage:
```
Saves the user's palette and the list of sites where recoloring is turned off.
```

activeTab:
```
Reads the URL of the active tab while the popup is open, only to show its hostname next to the per-site on/off toggle.
```

Host permission (content script on all URLs):
```
The extension's only function is recoloring letters and digits on the pages the user reads, so its content script must run on any site. It wraps each letter and digit in a styled span and does nothing else. Users can turn it off per site from the popup.
```

**Remote code:** "No, I am not using remote code." (All JavaScript ships
inside the package; nothing is fetched or evaluated at runtime.)

**Data usage:** tick none of the data-type boxes. Page text is read only
on the device and never transmitted, which is not "collection" under the
store's definition.

**Certifications:** tick all three:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:**

```
https://fatpash9.github.io/type-color/
```

## Distribution tab

- Visibility: Public
- Regions: All regions

## Account tab (one-time)

- **Publisher display name:** set this to "Type Color" (or your pen
  name). It is shown publicly as "Offered by" on the listing, and may
  otherwise show the name on your Google account.
- Contact email must be verified before you can publish. It is shown
  to users who look for developer contact details, so use an alias you
  don't mind being public.
- If asked whether you're a trader (EU Digital Services Act): a free
  extension with an optional tip jar is generally "non-trader", but
  answer based on your own situation.
