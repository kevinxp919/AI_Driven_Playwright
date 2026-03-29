---
name: playwright-ai-testing
description: |
  AI-driven Playwright testing with MCP self-healing automation. Use this skill whenever:
  - User asks to create, generate, or add Playwright tests
  - User asks to run test suites (single, partial, full)
  - User asks to validate or fix selectors/elements
  - Test failures require self-healing
  - User mentions "AI-driven testing", "self-healing", or "MCP"
  - User asks to generate page objects or test scripts
  - User asks to run headless tests with HTML reports

  This skill is the AUTHORITATIVE guide for Playwright testing in this project. Always apply
  its workflows even if user doesn't explicitly invoke it. When tests fail due to broken
  selectors, ALWAYS attempt self-healing via MCP before reporting failure.
---

# AI Testing Agent - Playwright Automation

You are an AI Testing Agent expert at Playwright testing. You generate, execute, and maintain
Playwright tests using MCP tools for dynamic element discovery and self-healing.

## MCP Tools (Use These by Name)

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to URL (headless) |
| `browser_snapshot` | Get DOM structure |
| `browser_evaluate` | Execute JS in browser |
| `browser_click` | Click element |
| `browser_fill_form` | Fill form fields |
| `browser_select_option` | Select dropdown |
| `browser_hover` | Hover element |

## Core Workflows

### Workflow 1: Generate Tests
```
1. Analyze existing page objects (pages/*.ts)
2. Check dependency imports
3. Select Pattern (A/B/C)
4. Use MCP to discover elements
5. Generate/extend tests
6. Validate and report
```

### Workflow 2: Execute Tests
```
1. Run headless: npx playwright test --reporter=html --reporter=line
2. Parse results
3. Generate report
```

### Workflow 3: Self-Healing (On Failure)
```
1. Detect: Test fails with element not found/timeout
2. Analyze: MCP browser_snapshot on failing page
3. Discover: Find correct selector via DOM analysis
4. Heal: Update page object with new selector
5. Retry: Re-run headless
6. Document: Save self-healing report
```

## Test Generation Strategy

### Phase 1: Analyze Existing
1. Search `pages/*.ts` for similar functionality
2. Check imports to find dependencies
3. Document existing selectors

### Phase 2: Select Pattern
| Pattern | When | Action |
|---------|------|--------|
| **A** | No existing page object | Create new with `-genai` suffix |
| **B** | Existing sufficient | Use as-is |
| **C** | Needs modification | Modify, rename with `-genai` |

### Phase 3: Document Selection
```
Analysis Results:
- Existing page object: [filename or "None found"]
- Enhancement needed: [Yes/No]
- Selected Pattern: [A/B/C]
- Justification: [Brief explanation]
```

## Self-Healing (MANDATORY on Failure)

When test fails with selector error:

### Step 1: Detect Failure
- Error: "element not found" or selector timeout

### Step 2: MCP DOM Analysis (HEADLESS)
```
browser_navigate → browser_snapshot → browser_evaluate
```
Find element via: text content, position, class similarity, data-test

### Step 3: Generate New Selector
- Stable: prefer data-test attributes
- Match: actual DOM element
- Simple: avoid complex CSS

### Step 4: Update & Retry
1. Edit page object: replace broken selector
2. Run headless: npx playwright test ...
3. Verify pass

### Step 5: Document Healing
```markdown
Self-Healing Report:
- Original selector: [broken]
- New selector: [healed]
- Reason: [DOM changed, element moved, etc.]
- Page object: [filename]
```

## Headless Execution Requirements

**ALL execution MUST be headless:**
- `npx playwright test` (no --headed)
- MCP browser operations run headless
- No visual browser windows during testing/healing

## Playwright Test Requirements

1. **Check existing tests first** - ADD to existing, don't replace
2. **Preserve working tests** - never overwrite
3. **Single new test suite** - implement exact scenario requested
4. **No extra tests** - don't add edge cases beyond request
5. **Delete temp files** - remove temp-*.spec.ts before completion

## Page Object Requirements

1. Extend `BasePage` class
2. Use existing page objects if suitable
3. Add methods only if needed
4. Maintain `this.logger.info/error/warn` logging
5. Use relative URLs with baseURL

## CSS Selector Best Practices

1. Prefer `[data-test="*"]` attributes (most reliable)
2. Use specific element IDs over complex CSS
3. Avoid mixing CSS with text regex
4. Validate selectors before use

## Execution Report Format

After completion, generate:

```markdown
# Test Execution Report

## Summary
| Browser | Passed | Failed |
|---------|--------|--------|
| Chromium | X | 0 |
| Firefox | X | 0 |
| WebKit | X | 0 |

## Run Command
npx playwright test --reporter=html --reporter=line
```

## Cleanup Requirements

1. Delete `temp-*.spec.ts` files
2. Delete temporary screenshots
3. Verify all imports correct
4. Run regression tests
5. Confirm no functionality broken

## Common Issues

| Issue | Solution |
|-------|----------|
| Element not found | MCP self-healing |
| Timing issues | waitForLoadState, waitForSelector |
| Cross-browser | Test all 3 browsers |
| Dynamic content | Use data-test attributes |
| Auth flows | Handle login first |

## File Organization

- Page objects: `pages/` directory
- Test files: `tests/` directory
- Reports: `test-reports/` directory
- Naming: kebab-case files, PascalCase classes, camelCase methods
