# Project Reorganization Plan

## Current Issues
1. ❌ `NewFrontend/harat-farm-link-main/` - Complex nested name
2. ❌ `Backend/` - Inconsistent casing (should be lowercase)
3. ❌ Multiple scattered documentation files
4. ❌ Unnecessary nested directories
5. ❌ Old migration guide (migration complete)
6. ❌ Outdated Lovable README in frontend

## Target Structure

```
agrifair/
├── backend/              # Spring Boot backend (lowercase)
│   ├── src/
│   ├── uploads/          # User uploads
│   ├── pom.xml
│   └── mvnw
│
├── frontend/             # React/TypeScript frontend (flattened)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                 # All documentation in one place
│   ├── setup.md
│   ├── api.md
│   └── guides/
│
└── README.md             # Main documentation
```

## Changes to Make

1. ✅ Rename `Backend/` → `backend/`
2. ✅ Move `NewFrontend/harat-farm-link-main/` → `frontend/` (flatten)
3. ✅ Remove `NewFrontend/` wrapper directory
4. ✅ Create `docs/` folder
5. ✅ Move documentation files to `docs/`
6. ✅ Remove `MIGRATION_GUIDE.md` (migration complete)
7. ✅ Remove old Lovable README from frontend
8. ✅ Consolidate analysis docs
9. ✅ Update README with new paths

