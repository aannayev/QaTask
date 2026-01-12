import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

interface ProductOptions {
  processor?: string;
  ram?: string;
  hdd?: string;
  os?: string;
  software?: string[];
}

export class ProductPage extends BasePage {
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly oldPrice: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly addToWishlistButton: Locator;
  readonly addToCompareButton: Locator;
  readonly productDescription: Locator;

  // Configurable product options
  readonly processorSelect: Locator;
  readonly ramSelect: Locator;
  readonly hddRadios: Locator;
  readonly osRadios: Locator;
  readonly softwareCheckboxes: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitle = page.locator(".product-name h1");
    this.productPrice = page.locator(".product-price");
    this.oldPrice = page.locator(".old-product-price");
    this.quantityInput = page.locator(".add-to-cart input.qty-input");
    this.addToCartButton = page.locator(
      '#add-to-cart-button-1, #add-to-cart-button-2, #add-to-cart-button-31, input[id^="add-to-cart-button"]'
    );
    this.addToWishlistButton = page.locator(".add-to-wishlist-button");
    this.addToCompareButton = page.locator(".add-to-compare-list-button");
    this.productDescription = page.locator(".full-description");

    // Configurable options
    this.processorSelect = page
      .locator('select[id*="product_attribute"][id*="1"]')
      .first();
    this.ramSelect = page
      .locator('select[id*="product_attribute"][id*="2"]')
      .first();
    this.hddRadios = page.locator(
      'input[type="radio"][id*="product_attribute"][id*="3"]'
    );
    this.osRadios = page.locator(
      'input[type="radio"][id*="product_attribute"][id*="4"]'
    );
    this.softwareCheckboxes = page.locator(
      'input[type="checkbox"][id*="product_attribute"][id*="5"]'
    );
  }

  async navigateToProduct(productUrl: string): Promise<void> {
    await this.navigateTo(productUrl);
    await this.waitForPageLoad();
  }

  async getProductPrice(): Promise<number> {
    const priceText = await this.productPrice.textContent();
    return this.parsePrice(priceText || "0");
  }

  parsePrice(priceString: string): number {
    const cleaned = priceString.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.clear();
    await this.quantityInput.fill(quantity.toString());
  }

  async getQuantity(): Promise<number> {
    const value = await this.quantityInput.inputValue();
    return parseInt(value) || 1;
  }

  async configureProductOptions(options: ProductOptions): Promise<void> {
    if (options.processor && (await this.processorSelect.isVisible())) {
      await this.processorSelect.selectOption({ label: options.processor });
    }

    if (options.ram && (await this.ramSelect.isVisible())) {
      await this.ramSelect.selectOption({ label: options.ram });
    }

    if (options.hdd) {
      const hddRadio = this.page.locator(`input[type="radio"]`).filter({
        has: this.page.locator(
          `xpath=following-sibling::label[contains(text(), "${options.hdd}")]`
        ),
      });
      if (await hddRadio.first().isVisible()) {
        await hddRadio.first().check();
      }
    }

    if (options.os) {
      const osLabel = this.page
        .locator("label")
        .filter({ hasText: options.os });
      if (await osLabel.isVisible()) {
        const forAttr = await osLabel.getAttribute("for");
        if (forAttr) {
          await this.page.locator(`#${forAttr}`).check();
        }
      }
    }

    if (options.software && options.software.length > 0) {
      for (const software of options.software) {
        const softwareLabel = this.page
          .locator("label")
          .filter({ hasText: software });
        if (await softwareLabel.isVisible()) {
          const forAttr = await softwareLabel.getAttribute("for");
          if (forAttr) {
            await this.page.locator(`#${forAttr}`).check();
          }
        }
      }
    }

    await this.page.waitForTimeout(500);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await this.page.waitForTimeout(1000);
  }

  async addToCartWithOptions(
    quantity: number,
    options?: ProductOptions
  ): Promise<void> {
    if (options) {
      await this.configureProductOptions(options);
    }
    await this.setQuantity(quantity);
    await this.addToCart();
  }

  async verifyProductAddedToCart(): Promise<void> {
    const notification = await this.getNotificationMessage();
    expect(notification.toLowerCase()).toContain("the product has been added");
  }

  async getProductName(): Promise<string> {
    return (await this.productTitle.textContent()) || "";
  }
}
