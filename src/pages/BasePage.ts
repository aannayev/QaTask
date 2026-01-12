import { Page, Locator } from "@playwright/test";

export class BasePage {
  readonly page: Page;
  readonly baseURL: string;

  // Common header elements
  readonly headerLinks: {
    register: Locator;
    login: Locator;
    logout: Locator;
    account: Locator;
    shoppingCart: Locator;
    wishlist: Locator;
  };

  // Cart indicator
  readonly cartQuantity: Locator;

  // Search
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // Notifications
  readonly notification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = "https://demowebshop.tricentis.com";

    // Initialize header elements
    this.headerLinks = {
      register: page.locator("a.ico-register"),
      login: page.locator("a.ico-login"),
      logout: page.locator("a.ico-logout"),
      account: page.locator("a.account").first(),
      shoppingCart: page.locator("a.ico-cart"),
      wishlist: page.locator("a.ico-wishlist"),
    };

    this.cartQuantity = page.locator(".cart-qty");
    this.searchInput = page.locator("#small-searchterms");
    this.searchButton = page.locator('input[type="submit"].search-box-button');
    this.notification = page.locator("#bar-notification");
  }

  async navigateTo(path: string = ""): Promise<void> {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(500);
  }

  async searchProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async getCartQuantity(): Promise<number> {
    const text = await this.cartQuantity.textContent();
    const match = text?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async goToCart(): Promise<void> {
    await this.headerLinks.shoppingCart.click();
    await this.waitForPageLoad();
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.headerLinks.logout.isVisible();
  }

  async getNotificationMessage(): Promise<string> {
    await this.notification.waitFor({ state: "visible", timeout: 5000 });
    const content = this.notification.locator(".content");
    return (await content.textContent()) || "";
  }

  async closeNotification(): Promise<void> {
    const closeButton = this.notification.locator(".close");
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }
}
