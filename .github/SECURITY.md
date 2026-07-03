# Security Policy

## Reporting a vulnerability

If you find a security issue in WarLens, please **do not open a public GitHub issue**.

Instead, email the maintainers directly with:

- A description of the issue
- Steps to reproduce
- The version / commit SHA you tested against
- Any proof-of-concept code or screenshots

We'll acknowledge within a few days and aim to ship a fix before disclosing publicly.

## Supported versions

This is a research / academic project. Only the `main` branch receives security updates.

## Known caveats

- The `/upload` endpoint accepts arbitrary user-supplied images. Files are size-limited (16 MB), extension-filtered (`png`, `jpg`, `jpeg` only), saved under a UUID-prefixed filename via `werkzeug.utils.secure_filename`, and deleted from disk immediately after inference (including on error).
- Internal errors return a generic `500` with no stack trace in the response body. Details are written to the server log only.
- The backend has **no authentication**. Don't expose it directly to the public internet — put it behind your own auth layer if you deploy it.
- CORS is disabled by default. Set `WARLENS_CORS_ORIGINS` to a comma-separated list of allowed origins (or `*` for any) before deploying a setup where the frontend and backend live on different origins.
