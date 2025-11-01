# Security Policy

## Supported Versions
We provide security fixes for the following branches:
- `main` (actively developed; receives all security fixes)
- `release-*` branches from the last 12 months (critical fixes only)

Older branches may receive fixes at our discretion.

## Reporting a Vulnerability
If you believe you’ve found a vulnerability, please email **security@jumpinai.com** with:
- A clear description and impact
- Steps to reproduce (PoC, logs, screenshots)
- Affected version/commit SHA and environment
- Your disclosure timeline expectations

Optional (preferred): encrypt your report with our PGP key (fingerprint: `XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX`).

We acknowledge reports within **72 hours**, provide a status update within **7 days**, and aim to fix critical issues within **14 days**.

**Please do not** open public Issues for potential vulnerabilities.

## Coordinated Disclosure
We follow responsible disclosure:
- We coordinate a fix, validate, and prepare a security release.
- We publish a **Security Advisory** and release notes once a patch is available.
- We credit reporters who’d like attribution (thank you!).

If exploitation is observed in the wild, we may accelerate public communication.

## Scope
This policy covers the code in this repository and the officially deployed JumpinAI services under:
- `*.jumpinai.com` (production and staging)
- Our managed infrastructure (e.g., Vercel deploys, Supabase backend, Cloudflare edge)

Third-party dependencies are in-scope only insofar as our usage introduces risk to JumpinAI users.

## Severity & Triage
We classify severity roughly per CVSS v3:
- **Critical**: RCE, auth bypass, data exfiltration of user data, supply chain compromise
- **High**: Significant privilege escalation, SSRF with data access, IDOR exposing sensitive data
- **Medium**: CSRF/redirects with meaningful impact, information disclosure without PII
- **Low**: Clickjacking, rate-limit gaps, minor misconfigurations

We may adjust severity based on exploitability in our environment.

## Fix, Release & Backports
- Patches land on `main`; we cut a security release as soon as tests and rollout checks pass.
- When warranted, we backport to supported `release-*` branches.
- We will provide mitigation steps if patches require breaking changes or extended rollout.

## Runtime & Data Protection Expectations
- **Secrets:** Never commit secrets. Use environment variables / GitHub Encrypted Secrets / Vercel project secrets / Supabase secrets.
- **Data handling:** Treat any PII or user data per least privilege; avoid logging sensitive data.
- **AuthN/Z:** Changes impacting authentication, authorization, or session handling require review by a code owner.

## Security Testing Guidelines
We welcome good-faith testing. Please:
- Avoid actions that degrade service (no DDoS).
- Use test accounts only; do not access other users’ data.
- Do not run automated scanners against production without prior consent.
- Limit testing to in-scope assets listed above.

If you need a dedicated test environment, contact **security@jumpinai.com**.

## Dependency & Supply Chain Hygiene
- We use Dependabot alerts/updates and review all production upgrades.
- Lockfiles are committed; releases are tagged.
- We generate an SBOM for releases when practical.
- Report suspicious packages or typosquatting to us.

## Build & Release Integrity
- Prefer signed commits and verified tags for releases.
- CI/CD runs on protected branches with required reviews.
- Release artifacts are built in CI from tagged commits.

## Contact & Hall of Fame
- **security@jumpinai.com**
- (Optional) Public key: link or block here
- (Optional) Hall of Fame: we credit researchers upon request once issues are fixed.

_Last updated: 2025-11-01_
