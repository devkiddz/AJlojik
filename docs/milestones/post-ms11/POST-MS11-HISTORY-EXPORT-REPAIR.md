# AJ Logik — Post-MS11 History Export Repair

The V2 Navbar replacement matched too much of
`ExperienceNavigationControls.tsx` and removed the
`ExperienceHistoryControl` export.

This repair:

- restores the complete file from the current committed `HEAD`;
- preserves both `ExperienceBackControl` and `ExperienceHistoryControl`;
- reapplies only the Navbar History trigger;
- presents History like Updates: icon and badge above, label below;
- leaves the account-sheet History presentation unchanged;
- does not alter the Featured Experience files.

## Install

Extract into the AJ Logik project root:

```powershell
node .\apply.post-ms11-history-export-repair.mjs
Remove-Item .\apply.post-ms11-history-export-repair.mjs

npm run typecheck
npm run lint
npm run build
```

Do not rerun the V2 installer.

After validation, the final UI repair will include the four V2 files, including
this corrected History file.
