/**
 * =================================================================================================
 * Multi-line Tag Completion Tests
 * =================================================================================================
 *
 * Tests for completion provider handling of multi-line tags.
 * Verifies correct detection of tag context across multiple lines.
 */

import * as assert from "node:assert";

/**
 * Test implementation of containsClosingTagBracket logic
 * This matches the implementation in CompletionProvider
 */
function containsClosingTagBracket(text: string): boolean {
  let insideDoubleQuotes = false;
  let insideSingleQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prevChar = i > 0 ? text[i - 1] : "";

    // Skip escaped quotes
    if (prevChar === "\\") {
      continue;
    }

    // Toggle quote state
    if (char === '"' && !insideSingleQuotes) {
      insideDoubleQuotes = !insideDoubleQuotes;
      continue;
    }

    if (char === "'" && !insideDoubleQuotes) {
      insideSingleQuotes = !insideSingleQuotes;
      continue;
    }

    // Check for closing bracket outside quotes
    if (char === ">" && !insideDoubleQuotes && !insideSingleQuotes) {
      return true;
    }
  }

  return false;
}

describe("Multi-line Tag Completion", function () {
  this.timeout(5000);

  describe("containsClosingTagBracket", () => {
    describe("should return true for real closing brackets", () => {
      const testCases = [
        {
          text: "<div>",
          description: "simple closing bracket",
        },
        {
          text: '<div class="foo">',
          description: "closing bracket after attribute",
        },
        {
          text: '  [attr]="value" >',
          description: "closing bracket with space before",
        },
        {
          text: '*ngIf="show">',
          description: "closing bracket after structural directive",
        },
        {
          text: '<button type="submit" [disabled]="false">',
          description: "closing bracket with multiple attributes",
        },
      ];

      for (const testCase of testCases) {
        it(testCase.description, () => {
          const result = containsClosingTagBracket(testCase.text);
          assert.strictEqual(result, true, `Expected '${testCase.text}' to contain closing bracket`);
        });
      }
    });

    describe("should return false for > inside string literals", () => {
      const testCases = [
        {
          text: '*ngIf="value > 5"',
          description: "comparison operator in double quotes",
        },
        {
          text: "[attr]='a > b'",
          description: "comparison operator in single quotes",
        },
        {
          text: '*ngIf="count >= 10"',
          description: "greater-or-equal operator",
        },
        {
          text: "[class]=\"size > 100 ? 'large' : 'small'\"",
          description: "complex expression with nested quotes",
        },
        {
          text: "*ngFor=\"let item of items | filter: '>10'\"",
          description: "> inside pipe argument",
        },
        {
          text: "[title]=\"'Value: ' + (x > y ? x : y)\"",
          description: "ternary with comparison",
        },
        {
          text: "*ngIf=\"message.includes('>')\"",
          description: "> as string argument",
        },
      ];

      for (const testCase of testCases) {
        it(testCase.description, () => {
          const result = containsClosingTagBracket(testCase.text);
          assert.strictEqual(result, false, `Expected '${testCase.text}' to NOT contain closing bracket`);
        });
      }
    });

    describe("should handle mixed cases", () => {
      const testCases = [
        {
          text: '[attr]="a > b" >',
          expected: true,
          description: "> in quotes followed by real closing bracket",
        },
        {
          text: '*ngIf="x > 5" [class]="active"',
          expected: false,
          description: "> in quotes, no closing bracket",
        },
        {
          text: 'class="foo" data-value="bar">',
          expected: true,
          description: "multiple attributes with closing bracket",
        },
        {
          text: '[disabled]="count > max" [hidden]="!show"',
          expected: false,
          description: "multiple attributes with > in quotes",
        },
      ];

      for (const testCase of testCases) {
        it(testCase.description, () => {
          const result = containsClosingTagBracket(testCase.text);
          assert.strictEqual(result, testCase.expected, `Expected '${testCase.text}' to return ${testCase.expected}`);
        });
      }
    });

    describe("should handle escaped quotes", () => {
      const testCases = [
        {
          text: '[title]="\\"Value > 5\\""',
          expected: false,
          description: "escaped double quotes with >",
        },
        {
          text: "[title]='\\'Value > 5\\''",
          expected: false,
          description: "escaped single quotes with >",
        },
        {
          text: '[attr]="\\"escaped\\"" >',
          expected: true,
          description: "escaped quotes followed by real closing bracket",
        },
      ];

      for (const testCase of testCases) {
        it(testCase.description, () => {
          const result = containsClosingTagBracket(testCase.text);
          assert.strictEqual(result, testCase.expected, `Expected '${testCase.text}' to return ${testCase.expected}`);
        });
      }
    });

    describe("should handle edge cases", () => {
      const testCases = [
        {
          text: "",
          expected: false,
          description: "empty string",
        },
        {
          text: "<",
          expected: false,
          description: "only opening bracket",
        },
        {
          text: ">",
          expected: true,
          description: "only closing bracket",
        },
        {
          text: '""',
          expected: false,
          description: "empty quotes",
        },
        {
          text: "''",
          expected: false,
          description: "empty single quotes",
        },
        {
          text: '">"',
          expected: false,
          description: "> in quotes only",
        },
        {
          text: "div",
          expected: false,
          description: "no brackets at all",
        },
      ];

      for (const testCase of testCases) {
        it(testCase.description, () => {
          const result = containsClosingTagBracket(testCase.text);
          assert.strictEqual(result, testCase.expected, `Expected '${testCase.text}' to return ${testCase.expected}`);
        });
      }
    });
  });
});
