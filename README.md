# Protype Dashboard

A React dashboard application for tracking cohort/student progress in a coding camp.

## Features

- Student progress tracking with status indicators
- KPI cards for quick metrics overview
- Cohort management dashboard
- Responsive design with modern UI

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible UI components
- **React Query** - Data fetching and caching
- **React Router v6** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

We recommend using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage Node.js versions.

### Installation

```bash
# Clone the repository
git clone https://github.com/evanhfw/protype-dashboard.git

# Navigate to project directory
cd protype-dashboard

# Install dependencies
npm install

# Start development server (runs on port 8080)
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run build:dev` | Development build (unminified) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- Report bugs and issues
- Suggest new features or improvements
- Submit pull requests
- Improve documentation
- Share feedback

### Development Workflow

1. **Fork the repository** - Click the "Fork" button on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/protype-dashboard.git
   cd protype-dashboard
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** - Follow our code style guidelines in [AGENTS.md](./AGENTS.md)

5. **Run checks before committing**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

6. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request** - Go to the original repository and click "New Pull Request"

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Reporting Issues & Feedback

### Found a Bug?

1. **Search existing issues** - Check if the bug has already been reported
2. **Create a new issue** - If not found, [open a new issue](https://github.com/YOUR_USERNAME/protype-dashboard/issues/new)
3. **Include details**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Browser and OS information

### Have a Feature Request?

1. [Open a new issue](https://github.com/YOUR_USERNAME/protype-dashboard/issues/new)
2. Use the title format: `[Feature Request] Your feature title`
3. Describe:
   - What problem does this solve?
   - How should it work?
   - Any alternatives you've considered

### General Feedback

We appreciate all feedback! You can:
- Open a [GitHub Discussion](https://github.com/YOUR_USERNAME/protype-dashboard/discussions) for questions and ideas
- Comment on existing issues to share your thoughts

## Project Structure

```
src/
  components/
    ui/           # shadcn/ui primitives (Button, Card, etc.)
    dashboard/    # Dashboard-specific components
  data/           # Data models and mock data
  lib/            # Utilities (cn helper)
  pages/          # Route page components
  test/           # Test setup and test files
  App.tsx         # Root component with providers
  main.tsx        # Entry point
```

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for everyone.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- All our contributors and supporters

---

**Questions?** Feel free to [open an issue](https://github.com/YOUR_USERNAME/protype-dashboard/issues) or start a [discussion](https://github.com/YOUR_USERNAME/protype-dashboard/discussions).
