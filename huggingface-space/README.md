---
title: WarLens API
emoji: 🛰️
colorFrom: red
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: Triage backend for conflict-zone image classification.
---

# WarLens — Hugging Face Space (backend)

This Space hosts the Flask + TensorFlow inference backend for [WarLens](https://github.com/omprxkash/warlens). The React frontend lives on Vercel and calls this Space at `/upload` and `/health`.

## How to deploy this Space

1. Create a new Space on huggingface.co with **SDK = Docker**.
2. Push this folder (`huggingface-space/`) as the Space's root, plus the project's `backend/` and `model/` folders, into the Space's git repo:

   ```bash
   git clone https://huggingface.co/spaces/<your-user>/warlens-api
   cd warlens-api
   cp -r ../warlens/huggingface-space/* .
   cp -r ../warlens/backend .
   cp -r ../warlens/model .
   git lfs install
   git lfs track "*.h5"
   git add .
   git commit -m "Initial Space deploy"
   git push
   ```

3. Wait for the build (~5 min). The Space URL becomes the value of `REACT_APP_API_URL` in the Vercel deployment.

## Notes

- Free CPU Spaces sleep after 48 h of no traffic. First request after sleep takes ~30 s to warm. The frontend shows a "warming up" hint during this window.
- The `.h5` weights need to be present in `model/`. They are not in the GitHub repo (large binaries) — track them via `git lfs` inside the Space, or download them at container startup from the HF Model Hub.
- `WARLENS_CORS_ORIGINS=*` here because the frontend is on a different origin (Vercel). Tighten to the exact Vercel URL once it's stable.
