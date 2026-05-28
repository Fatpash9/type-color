# Type Color — Privacy Policy

**Effective:** 2026-05-27

Type Color is a Chrome extension that recolors letters and digits on
web pages according to a palette you configure. This policy describes
what the extension does with data and what it does not do.

## What the extension does

- Reads text on the web pages you visit, in your browser, only to
  recolor individual letters and digits. The reading happens locally
  on your device; no text is transmitted anywhere.
- Saves your palette and per-site preferences using Chrome's built-in
  `chrome.storage.sync` API. This data stays in your Google account's
  Chrome profile. If you are signed in to Chrome on multiple devices,
  Chrome itself may sync this data between them. It is not sent to
  the extension developer or any third party.
- Reads the URL of the active tab when you open the extension popup,
  only to show the hostname next to the per-site toggle.

## What the extension does not do

- It does not collect, transmit, or sell any personal data.
- It does not contact any server controlled by the developer or by
  any third party.
- It does not include analytics, telemetry, advertising, or tracking
  of any kind.
- It does not read or modify form fields, password fields, or
  `contenteditable` content. These are skipped by design.

## Permissions

- **Read and change all your data on websites you visit** (host
  access, `<all_urls>`): required to recolor text on the sites where
  you use the extension. The extension only reads page text and
  inserts span wrappers to apply colors; it does not interact with
  the page in any other way.
- **storage**: to save your palette and per-site toggles on your
  device.
- **activeTab**: to read the URL of the currently active tab while
  the popup is open, used only to display the hostname in the
  per-site toggle.

## Changes

If this policy changes, the updated version will be published at the
same URL with a new effective date.

## Contact

For questions about this policy, contact: **privacy@privacys.app**
