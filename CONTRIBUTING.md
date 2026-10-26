# Contributing to Orbit

Thank you for considering a contribution. Bug reports, feature proposals,
documentation improvements, and focused code changes are welcome.

## Bug reports

Before opening a report, search the
[existing issues](https://github.com/M003aad/Orbit/issues) for duplicates.
Include the browser and version, Orbit version, affected page/action, expected
and actual behavior, and clear reproduction steps. Remove personal information
from screenshots and logs. Do not report security vulnerabilities publicly;
follow [SECURITY.md](./SECURITY.md).

## Feature proposals

Search existing issues first, then open an issue describing the user need,
proposed behavior, and any relevant alternatives or permission changes. For a
substantial behavior change, discuss the proposal before implementing it.

## Local development

1. Fork and clone `https://github.com/M003aad/Orbit.git`, then create a branch
   for your change.
2. Install Node.js 22 or newer and npm.
3. Install the locked development dependencies with `npm ci`.
4. Run `npm run lint` and `npm run build`.
5. Load the project folder unpacked in Chrome or Edge through the browser's
   extensions page with Developer mode enabled. Reload the extension after
   changing files and manually exercise the affected behavior.

Orbit uses vanilla JavaScript, HTML, and CSS and has no bundler or automated
browser test suite. Keep the existing patterns and avoid broadening extension
permissions unless the feature requires it.

## Pull requests

- Keep each pull request focused and explain the motivation and behavior
  change.
- Update user-facing documentation when behavior changes.
- Explain manifest permission changes and include screenshots for visual
  changes when useful.
- State which checks and manual browser tests you ran; note anything you could
  not test.
- Do not include credentials, personal data, or unrelated generated files.

By contributing, you agree that your contribution may be distributed under
the project's [GNU Affero General Public License v3.0](./LICENSE).
