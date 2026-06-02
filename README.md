Nikon AF Fine-Tune Report Tool v17

Hard live-sync patch:
- Auto reference writes to jobRef as NIK-YYYYMMDD-001.
- Lens description writes live to nikonLiveLensText.
- Saved lens number writes live to nikonLiveLensNo.
- Single mode applies single-mode to nikonMenu and changes WIDE to AF.
- This patch binds directly to the real HTML IDs and re-syncs after input/change/click events.

Upload all files and delete old nikon-app-v*.js files from GitHub.
