# Electrical Safety Awareness & Safe Isolation (UK)

Static, vanilla HTML/CSS/JS training website for GitHub Pages.

## Deploy to GitHub Pages
1. Push this repository to GitHub.
2. In **Settings → Pages**, set source to **Deploy from a branch**.
3. Select your default branch and `/ (root)`.
4. Save, then open the published URL.

## Included pages
- `index.html` – learner name capture + start/resume
- `course.html` – learning modules and interactive checks
- `quiz.html` – 20-question final assessment with critical-question rule
- `certificate.html` – printable certificate + JSON export
- `signoff.html` – optional practical sign-off form
- `matrix.html` – training matrix summary (toggleable)

## Data storage
All progress and results are stored in `localStorage` key:
- `als_electrical_safety_v1`

## Notes
- No backend required.
- Works offline after first load.
- Print styles provided for certificate and sign-off form (A4).

## Training images
- Hazard and emergency modules now render photo galleries from `assets/training-images/`.
- Add the supplied site photos using the filenames listed in `assets/training-images/README.md`.
