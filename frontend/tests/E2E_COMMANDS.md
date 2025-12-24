# E2E Testing Commands

## Run All Tests
```bash
cd frontend
npm run test:e2e
```

## Run Specific Test
```bash
npx playwright test emotion-migration.spec.ts
```

## Run in UI Mode (Interactive)
```bash
npx playwright test --ui
```

## Run with Debug
```bash
npx playwright test emotion-migration.spec.ts --debug
```

## View Test Report
```bash
npx playwright show-report
```

## What Gets Tested

### Emotion Migration Tests
- ✅ Emotion dashboard loads
- ✅ Emotion stats API (ChatMessage-based)
- ✅ Emotion logs API (ChatMessage-based)
- ✅ Emotion trends chart
- ✅ Emotion insights API
- ✅ Chat emotion detection
- ✅ User stats emotion count
- ✅ No console errors
- ✅ API endpoint verification
- ✅ Doctor patient emotion view

## Prerequisites

1. Backend running on port 5000:
```bash
cd backend && python -m flask run --port 5000
```

2. Test users exist:
- User: test@test.com / Test123!@#
- Doctor: doctor@test.com / Test123!@#

## Expected Results

All tests should PASS:
```
✓ emotion-migration.spec.ts:10 Emotion Dashboard loads with data
✓ emotion-migration.spec.ts:25 Emotion stats API returns correct data
✓ emotion-migration.spec.ts:45 Emotion logs API returns ChatMessage data
✓ emotion-migration.spec.ts:70 Emotion trends chart renders
✓ emotion-migration.spec.ts:85 Emotion insights API works correctly
✓ emotion-migration.spec.ts:105 Chat message includes emotion detection
✓ emotion-migration.spec.ts:130 User stats shows emotion count
✓ emotion-migration.spec.ts:150 No console errors on emotion pages
✓ emotion-migration.spec.ts:175 API calls use correct endpoints
✓ emotion-migration.spec.ts:210 Doctor can view patient emotion data
```

10 passed (30s)
