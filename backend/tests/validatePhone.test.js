/**
 * Automated tests for Indian mobile number validation.
 * 
 * Run with: node backend/tests/validatePhone.test.js
 * 
 * Tests cover:
 * - Valid Indian mobile numbers (starting with 6-9, exactly 10 digits)
 * - Valid numbers with +91 prefix
 * - Invalid numbers starting with 0-5
 * - Numbers with fewer/more than 10 digits
 * - Numbers with letters/special characters
 * - Edge cases (null, undefined, empty string, whitespace)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isValidIndianPhone,
  validateAndCleanPhone,
} from "../utilities/validatePhone.js";

describe("isValidIndianPhone()", () => {
  describe("Valid Indian mobile numbers", () => {
    const validNumbers = [
      "9876543210",
      "6123456789",
      "7000000000",
      "8999999999",
      "9999999999",
      "6000000000",
    ];

    validNumbers.forEach((phone) => {
      it(`should accept ${phone}`, () => {
        assert.equal(isValidIndianPhone(phone), true);
      });
    });

    it("should accept valid number with +91 prefix (+919876543210)", () => {
      assert.equal(isValidIndianPhone("+919876543210"), true);
    });

    it("should accept valid number with +91 and space (+91 9876543210)", () => {
      assert.equal(isValidIndianPhone("+91 9876543210"), true);
    });

    it("should trim whitespace and validate valid number", () => {
      assert.equal(isValidIndianPhone("  9876543210  "), true);
    });
  });

  describe("Invalid numbers - wrong starting digit (0-5)", () => {
    const invalidStartingDigits = [
      "1234567890", // starts with 1
      "0123456789", // starts with 0
      "2345678901", // starts with 2
      "3456789012", // starts with 3
      "4567890123", // starts with 4
      "5678901234", // starts with 5
    ];

    invalidStartingDigits.forEach((phone) => {
      it(`should reject ${phone} (starts with ${phone[0]})`, () => {
        assert.equal(isValidIndianPhone(phone), false);
      });
    });
  });

  describe("Invalid numbers - wrong length", () => {
    it("should reject number with 9 digits (987654321)", () => {
      assert.equal(isValidIndianPhone("987654321"), false);
    });

    it("should reject number with 11 digits (98765432101)", () => {
      assert.equal(isValidIndianPhone("98765432101"), false);
    });

    it("should reject empty string", () => {
      assert.equal(isValidIndianPhone(""), false);
    });
  });

  describe("Invalid numbers - containing non-digit characters", () => {
    it("should reject number with letters (98A6543210)", () => {
      assert.equal(isValidIndianPhone("98A6543210"), false);
    });

    it("should reject number with special characters (98765-43210)", () => {
      assert.equal(isValidIndianPhone("98765-43210"), false);
    });

    it("should reject number with spaces in middle (98765 43210)", () => {
      assert.equal(isValidIndianPhone("98765 43210"), false);
    });
  });

  describe("Edge cases", () => {
    it("should return false for null", () => {
      assert.equal(isValidIndianPhone(null), false);
    });

    it("should return false for undefined", () => {
      assert.equal(isValidIndianPhone(undefined), false);
    });

    it("should return false for non-string input (number type)", () => {
      assert.equal(isValidIndianPhone(9876543210), false);
    });
  });
});

describe("validateAndCleanPhone()", () => {
  it("should return isValid: true for valid phone", () => {
    const result = validateAndCleanPhone("9876543210");
    assert.equal(result.isValid, true);
    assert.equal(result.cleaned, "9876543210");
    assert.equal(result.message, "Valid Indian mobile number.");
  });

  it("should return isValid: true for valid phone with +91 prefix", () => {
    const result = validateAndCleanPhone("+919876543210");
    assert.equal(result.isValid, true);
    assert.equal(result.cleaned, "9876543210");
  });

  it("should return isValid: false for invalid phone (1234567890)", () => {
    const result = validateAndCleanPhone("1234567890");
    assert.equal(result.isValid, false);
    assert.equal(result.cleaned, "1234567890");
    assert.equal(result.message, "Please enter a valid Indian mobile number.");
  });

  it("should return isValid: false for null input", () => {
    const result = validateAndCleanPhone(null);
    assert.equal(result.isValid, false);
    assert.equal(result.cleaned, null);
    assert.equal(result.message, "Please enter a valid Indian mobile number.");
  });

  it("should return isValid: false for undefined input", () => {
    const result = validateAndCleanPhone(undefined);
    assert.equal(result.isValid, false);
    assert.equal(result.cleaned, null);
    assert.equal(result.message, "Please enter a valid Indian mobile number.");
  });

  it("should return isValid: false for short number (987654321)", () => {
    const result = validateAndCleanPhone("987654321");
    assert.equal(result.isValid, false);
  });

  it("should return isValid: false for letter number (98A6543210)", () => {
    const result = validateAndCleanPhone("98A6543210");
    assert.equal(result.isValid, false);
  });

  it("should return isValid: false for number starting with 5 (5678901234)", () => {
    const result = validateAndCleanPhone("5678901234");
    assert.equal(result.isValid, false);
  });
});