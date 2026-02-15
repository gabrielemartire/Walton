
# <img width="80" alt="Walton Logo" src="https://github.com/user-attachments/assets/5cd9f0da-b95f-4fb2-a50d-9b6cbd72eff2" /> Walton

> *"It belongs in a museum... unless it's still maintained."*

**Walton** is a GitHub Action that analyzes your npm dependencies and hunts for better-maintained forks when packages go stale. _It digs through your project's artifacts to unearth hidden treasures._

![walton](https://github.com/user-attachments/assets/bf6108a6-ba43-4026-8b5d-a427efccb37a)


## What it does

Walton reads your `package.json`, fetches information from the npm registry, and for each dependency:

- Checks when the package was last updated
- Flags packages that haven't been updated in more than 700 days as "old"
- For old packages, searches GitHub for active forks
- Rates forks based on stars, watchers, issues, discussions, and more
- Provides a summary table of your dependencies' health

## Usage

### Add Walton to your repository

Create a workflow file in your repository at `.github/workflows/walton.yml`:

```yaml
name: Walton Dependency Check

on:
  # Run on push to main branch
  push:
    branches: [main]
  # Run weekly on Monday at 9am
  schedule:
    - cron: '0 9 * * 1'
  # Allow manual trigger
  workflow_dispatch:

jobs:
  check-dependencies:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run Walton
        uses: gabrielemartire/walton@main
```

### Example Output

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                        WALTON                             ║
║                                                           ║
║     Excavating your node_modules for lost artifacts...    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

====Walton's resume====
┌─────────┬───────────┬──────────┬────────────┬─────────┬────────────┐
│ (index) │ name      │ latest   │ LastUpdate │ license │ waltonSays │
├─────────┼───────────┼──────────┼────────────┼─────────┼────────────┤
│ 0       │ 'react'   │ '18.2.0' │ '11/15/24' │ 'MIT'   │ 'its ok'   │
│ 1       │ 'lodash'  │ '4.17.21'│  '3/15/23' │ 'MIT'   │ 'its old!' │
└─────────┴───────────┴──────────┴────────────┴─────────┴────────────┘
```

For packages marked as "old", Walton also shows a table of promising forks with ratings.

## Fork Rating System

Walton rates forks based on:

| Factor | Weight |
|--------|--------|
| Stars | ×5 |
| Watchers | ×3 |
| Forks | ×2 |
| Has Wiki | +2 |
| Has Discussions | +3 |
| Open Issues | +5 |

Archived or disabled forks receive a rating of 0 and are filtered out.

## Requirements

- A `package.json` file in your repository root with npm dependencies
- Node.js 20+ (handled by the action)

## How It Works

1. Reads dependencies from your `package.json`
2. Fetches package metadata from the npm registry
3. Checks the last modified date for each package
4. For packages older than 10 days:
   - Queries GitHub API for the repository info
   - Fetches and analyzes forks
   - Calculates ratings for active forks
5. Outputs a summary table with recommendations

## Configuration

Currently, Walton uses these defaults:

- **Staleness threshold**: 700 days without updates
- **Minimum fork rating**: 5 (forks below this are filtered)

*Custom configuration options coming soon!*

## Improvements Roadmap

- [ ] **Better fork ranking system** - Improve the algorithm with additional metrics (commit frequency, contributor activity, release cadence, test coverage)
- [ ] **Configurable staleness threshold** - Allow users to set custom time thresholds
- [ ] **GITHUB_TOKEN** - Allow users to use GITHUB_TOKEN
- [x] **Enhanced console output** - Better formatted tables, colors, progress indicators, and summary statistics
- [ ] **Output to GitHub PR comments** - Auto-comment on PRs with dependency health reports
- [ ] **Badge generation for README** - Show dependency health status badge
- [x] **CI/CD pipeline integration** - Fail builds when critical dependencies are stale

<img width="233" height="35" alt="image" src="https://github.com/user-attachments/assets/8b292b37-1989-4008-9ac8-c271939d21ed" />

- [ ] **Maintainer proposal generator** - Generate standard issue templates to propose as new maintainers
- [ ] **Fork discovery helper** - Create links to announce official forks in original repositories
- [ ] **Package Manager Support** `yarn.lock` and `pnpm-lock.yaml support` Analyze lock files for accurate dependency trees
- [ ] **Monorepo support** Handle workspaces and multiple package.json files
- [ ] **GitHub rate limiting handling** - Graceful degradation when API limits are reached
- [ ] **Exclude list** - Allow users to ignore specific packages (known false positives)

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see `LICENSE` for details.

## Author

**Gabriele Martire**
- GitHub: [@gabrielemartire](https://github.com/gabrielemartire)
- Website: [gabrielemartire.github.io](https://gabrielemartire.github.io/)

---

*Named after Henry **Walton** "Indiana" Jones Jr. - because great adventures start with knowing what you're working with.*
