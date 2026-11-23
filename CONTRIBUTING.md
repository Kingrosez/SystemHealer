# Contributing to SystemHealer

Thanks for your interest in contributing to SystemHealer. This document explains
how to set up the project, the workflow we follow, and the standards we expect.

## 1. Code of Conduct

Be respectful, constructive, and patient. We welcome contributors of all skill
levels. Harassment, discrimination, or hostile behavior will not be tolerated.

## 2. Getting Started

### 2.1 Prerequisites
- Windows 10 (build 19041+) or Windows 11
- Node.js 20+ and npm
- Java 17+ and Maven
- Git
- Administrator access (required for running repair features locally)

### 2.2 Local Setup
```bash
git clone https://github.com/Kingrosez/SystemHealer.git
cd SystemHealer

# Frontend
cd frontend
npm install

# Backend
cd ../backend
./mvnw clean install
```

## 3. Repository Structure
```
SystemHealer/
├── frontend/          # React TypeScript SPA
├── backend/           # Spring Boot REST API
├── docs/              # Documentation
└── README.md
```

## 4. Development Workflow

### Branch Naming
Use the convention `<type>/<short-name>`:
- Features: `feature/user-authentication`
- Bug fixes: `fix/cors-config`
- Documentation: `docs/fill-documentation`
- Tests: `test/duplicate-finder`

### Commit Messages
Follow Conventional Commits format:
```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

Example: `feat(repair): add SFC scan endpoint`

## 5. Code Standards

### Frontend (React + TypeScript)
- Follow the design system in `docs/frontend/DESIGN_SYSTEM.md`
- Use functional components with TypeScript interfaces
- ESLint + Prettier for formatting
- Write unit tests with Jest/React Testing Library

### Backend (Spring Boot Java)
- Java 17+, Spring Boot 3.x
- RESTful API design
- Write unit tests with JUnit 5 + Mockito
- Log key operations with timestamps

## 6. Testing

### Run Tests
```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
./mvnw test
```

### Test Coverage
- Aim for 80%+ coverage on new features
- Document trade-offs for lower coverage in code comments

## 7. Pull Request Process

1. Create a feature branch from `main`
2. Make focused commits with clear messages
3. Push your branch and open a PR
4. Ensure CI passes and review is approved
5. Squash-merge when approved

## 8. Security

- Never commit secrets, API keys, or `.env` files
- Use GitHub Secrets for CI/CD credentials
- Review security implications before merging destructive changes

## 9. Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Reference relevant documentation in your issue/PR

## 10. License

By contributing, you agree your work will be licensed under the project's
MIT license.