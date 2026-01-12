import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly validationErrors: Locator;
  readonly loginErrorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator("#Email");
    this.passwordInput = page.locator("#Password");
    this.rememberMeCheckbox = page.locator("#RememberMe");
    this.loginButton = page.locator("input.login-button");
    this.forgotPasswordLink = page.locator('a[href*="passwordrecovery"]');
    this.validationErrors = page.locator(".validation-summary-errors");
    this.loginErrorMessage = page.locator(".message-error");
  }

  async navigate(): Promise<void> {
    await this.navigateTo("/login");
  }

  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }

    await this.loginButton.click();
    await this.waitForPageLoad();
  }

  async verifyLoginSuccess(expectedEmail: string): Promise<void> {
    await expect(this.headerLinks.logout).toBeVisible();
    const accountLink = this.page
      .locator("a.account")
      .filter({ hasText: expectedEmail });
    await expect(accountLink).toBeVisible();
  }

  async getValidationError(): Promise<string> {
    return (await this.validationErrors.textContent()) || "";
  }
}
