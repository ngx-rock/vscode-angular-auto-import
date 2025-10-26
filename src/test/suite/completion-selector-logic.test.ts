/**
 * =================================================================================================
 * Completion Selector Logic Tests
 * =================================================================================================
 *
 * Tests for completion provider selector matching logic.
 * Verifies correct identification of element vs attribute selectors.
 */

import * as assert from "node:assert";

/**
 * Test implementation of isElementSelector logic
 */
function isElementSelector(selector: string): boolean {
  // Pure attribute selectors start with "["
  if (selector.startsWith("[")) {
    return false;
  }

  // Remove :not() pseudo-classes to check the main selector
  const withoutNotPseudoClass = selector.replace(/:not\([^)]+\)/g, "");

  // If there are still "[" outside :not(), it's an attribute selector
  if (withoutNotPseudoClass.includes("[")) {
    return false;
  }

  // Element selectors start with a tag name
  return /^[a-zA-Z]/.test(selector);
}

/**
 * Test implementation of originalIsPureAttribute logic
 */
function isOriginalPureAttribute(originalSelector: string): boolean {
  return originalSelector.startsWith("[") && !originalSelector.includes(",");
}

/**
 * Combined logic for determining if selector should be treated as element selector
 */
function shouldTreatAsElementSelector(elementSelector: string, originalSelector: string): boolean {
  const selectorIsElement = isElementSelector(elementSelector);
  const originalIsPureAttribute = isOriginalPureAttribute(originalSelector);
  return selectorIsElement && !originalIsPureAttribute;
}

describe("Completion Selector Logic", function () {
  this.timeout(5000);

  describe("isElementSelector", () => {
    const testCases = [
      // Pure element selectors
      {
        selector: "app-header",
        expected: true,
        description: "simple element selector",
      },
      {
        selector: "jupiter-table",
        expected: true,
        description: "kebab-case element selector",
      },
      {
        selector: "router-outlet",
        expected: true,
        description: "Angular built-in element selector",
      },

      // Element selectors with :not()
      {
        selector: "custom-input:not([disabled])",
        expected: true,
        description: "element selector with :not() pseudo-class",
      },
      {
        selector: "custom-input:not([disabled]):not([readonly])",
        expected: true,
        description: "element selector with multiple :not() pseudo-classes",
      },

      // Pure attribute selectors
      {
        selector: "[ngModel]",
        expected: false,
        description: "pure attribute selector",
      },
      {
        selector: "[routerLink]",
        expected: false,
        description: "Angular router attribute selector",
      },
      {
        selector: "[disabled]",
        expected: false,
        description: "HTML attribute selector",
      },

      // Simplified attribute selectors (without brackets)
      {
        selector: "ngModel",
        expected: true, // Will be corrected by originalIsPureAttribute check
        description: "simplified attribute selector without brackets",
      },
      {
        selector: "routerLink",
        expected: true, // Will be corrected by originalIsPureAttribute check
        description: "simplified router attribute without brackets",
      },

      // Composite selectors (element + attribute)
      {
        selector: "button[mat-button]",
        expected: false,
        description: "element with attribute selector",
      },
      {
        selector: "table[jupiter-table]",
        expected: false,
        description: "element with custom attribute",
      },
      {
        selector: "input[type=text]",
        expected: false,
        description: "element with attribute value",
      },

      // Edge cases
      {
        selector: "jupiter-table[bigRows]",
        expected: false,
        description: "custom element with attribute",
      },
      {
        selector: "*ngIf",
        expected: false,
        description: "structural directive (starts with *)",
      },
    ];

    for (const testCase of testCases) {
      it(`should identify ${testCase.description}`, () => {
        const result = isElementSelector(testCase.selector);
        assert.strictEqual(result, testCase.expected, `Expected '${testCase.selector}' to return ${testCase.expected}`);
      });
    }
  });

  describe("isOriginalPureAttribute", () => {
    const testCases = [
      // Pure attribute selectors
      {
        originalSelector: "[ngModel]",
        expected: true,
        description: "pure attribute selector",
      },
      {
        originalSelector: "[routerLink]",
        expected: true,
        description: "router link attribute",
      },

      // Composite selectors (with comma)
      {
        originalSelector: "jupiter-table, table[jupiter-table]",
        expected: false,
        description: "composite selector with comma",
      },
      {
        originalSelector: "[attr1], [attr2]",
        expected: false,
        description: "multiple attribute selectors",
      },

      // Element selectors
      {
        originalSelector: "app-header",
        expected: false,
        description: "element selector",
      },
      {
        originalSelector: "custom-input:not([disabled])",
        expected: false,
        description: "element with :not()",
      },

      // Element + attribute
      {
        originalSelector: "button[mat-button]",
        expected: false,
        description: "element with attribute (no comma)",
      },
    ];

    for (const testCase of testCases) {
      it(`should identify ${testCase.description}`, () => {
        const result = isOriginalPureAttribute(testCase.originalSelector);
        assert.strictEqual(
          result,
          testCase.expected,
          `Expected '${testCase.originalSelector}' to return ${testCase.expected}`
        );
      });
    }
  });

  describe("shouldTreatAsElementSelector (combined logic)", () => {
    const testCases = [
      // Case 1: [ngModel] directive
      {
        elementSelector: "ngModel",
        originalSelector: "[ngModel]",
        expected: false,
        description: "ngModel directive (simplified variant)",
        context: "attribute",
      },
      {
        elementSelector: "[ngModel]",
        originalSelector: "[ngModel]",
        expected: false,
        description: "ngModel directive (full variant)",
        context: "attribute",
      },

      // Case 2: jupiter-table directive
      {
        elementSelector: "jupiter-table",
        originalSelector: "jupiter-table, table[jupiter-table]",
        expected: true,
        description: "jupiter-table directive (element variant)",
        context: "tag",
      },
      {
        elementSelector: "table[jupiter-table]",
        originalSelector: "jupiter-table, table[jupiter-table]",
        expected: false,
        description: "jupiter-table directive (attribute variant)",
        context: "attribute",
      },
      {
        elementSelector: "[jupiter-table]",
        originalSelector: "jupiter-table, table[jupiter-table]",
        expected: false,
        description: "jupiter-table directive (bracketed attribute variant)",
        context: "attribute",
      },

      // Case 3: custom-input:not([disabled]) directive
      {
        elementSelector: "custom-input:not([disabled]):not([readonly])",
        originalSelector: "custom-input:not([disabled]):not([readonly])",
        expected: true,
        description: "custom-input directive with :not()",
        context: "tag",
      },
      {
        elementSelector: "custom-input",
        originalSelector: "custom-input:not([disabled]):not([readonly])",
        expected: true,
        description: "custom-input directive (simplified)",
        context: "tag",
      },

      // Case 4: button[mat-button] directive
      {
        elementSelector: "button[mat-button]",
        originalSelector: "button[mat-button]",
        expected: false,
        description: "Material button directive",
        context: "attribute",
      },
      {
        elementSelector: "mat-button",
        originalSelector: "button[mat-button]",
        expected: true, // Simplified variant, but should work in attribute context
        description: "Material button directive (simplified)",
        context: "attribute",
      },
      {
        elementSelector: "[mat-button]",
        originalSelector: "button[mat-button]",
        expected: false,
        description: "Material button directive (bracketed)",
        context: "attribute",
      },

      // Case 5: Pure components
      {
        elementSelector: "app-header",
        originalSelector: "app-header",
        expected: true,
        description: "app-header component",
        context: "tag",
      },
      {
        elementSelector: "router-outlet",
        originalSelector: "router-outlet",
        expected: true,
        description: "router-outlet component",
        context: "tag",
      },

      // Case 6: routerLink directive
      {
        elementSelector: "routerLink",
        originalSelector: "[routerLink]",
        expected: false,
        description: "routerLink directive (simplified)",
        context: "attribute",
      },
      {
        elementSelector: "[routerLink]",
        originalSelector: "[routerLink]",
        expected: false,
        description: "routerLink directive (full)",
        context: "attribute",
      },

      // Case 7: JupiterBigRowsDirective
      {
        elementSelector: "jupiter-table[bigRows]",
        originalSelector: "jupiter-table[bigRows], table[jupiter-table][bigRows]",
        expected: false,
        description: "jupiter-table with bigRows attribute",
        context: "attribute",
      },
      {
        elementSelector: "table[jupiter-table][bigRows]",
        originalSelector: "jupiter-table[bigRows], table[jupiter-table][bigRows]",
        expected: false,
        description: "table with jupiter-table and bigRows attributes",
        context: "attribute",
      },
    ];

    for (const testCase of testCases) {
      it(`should treat '${testCase.elementSelector}' as ${testCase.context} selector (${testCase.description})`, () => {
        const result = shouldTreatAsElementSelector(testCase.elementSelector, testCase.originalSelector);
        assert.strictEqual(
          result,
          testCase.expected,
          `Expected '${testCase.elementSelector}' with originalSelector '${testCase.originalSelector}' to return ${testCase.expected}`
        );
      });
    }
  });
});
