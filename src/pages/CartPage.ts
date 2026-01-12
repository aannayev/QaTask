import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly cartTable: Locator;
  readonly removeCheckboxes: Locator;
  readonly updateCartButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly termsCheckbox: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly subtotalPrice: Locator;
  readonly shippingPrice: Locator;
  readonly taxPrice: Locator;
  readonly totalPrice: Locator;
  readonly discountCode: Locator;
  readonly applyDiscountButton: Locator;
  readonly giftCardCode: Locator;
  readonly applyGiftCardButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator(".cart-item-row");
    this.cartTable = page.locator(".cart");
    this.removeCheckboxes = page.locator('input[name="removefromcart"]');
    this.updateCartButton = page.locator('input[name="updatecart"]');
    this.continueShoppingButton = page.locator(
      'input[name="continueshopping"]'
    );
    this.termsCheckbox = page.locator("#termsofservice");
    this.checkoutButton = page.locator("#checkout");
    this.emptyCartMessage = page.locator(".order-summary-content");
    this.subtotalPrice = page.locator(
      ".order-subtotal .cart-total-right .product-price, .order-subtotal .product-price"
    );
    this.shippingPrice = page.locator(
      ".shipping-cost .cart-total-right .product-price, .shipping-cost .product-price"
    );
    this.taxPrice = page.locator(
      ".tax-value .cart-total-right .product-price, .tax-value .product-price"
    );
    this.totalPrice = page.locator(
      ".order-total .cart-total-right .product-price, .order-total .product-price"
    );
    this.discountCode = page.locator("#discountcouponcode");
    this.applyDiscountButton = page.locator(
      'input[name="applydiscountcouponcode"]'
    );
    this.giftCardCode = page.locator("#giftcardcouponcode");
    this.applyGiftCardButton = page.locator(
      'input[name="applygiftcardcouponcode"]'
    );
  }

  async navigate(): Promise<void> {
    await this.navigateTo("/cart");
    await this.waitForPageLoad();
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async isCartEmpty(): Promise<boolean> {
    const itemCount = await this.getCartItemCount();
    return itemCount === 0;
  }

  async getCartItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const itemCount = await this.cartItems.count();

    for (let i = 0; i < itemCount; i++) {
      const row = this.cartItems.nth(i);
      const name = (await row.locator(".product-name").textContent()) || "";
      const priceText =
        (await row.locator(".product-unit-price").textContent()) || "0";
      const quantityValue = await row.locator(".qty-input").inputValue();
      const subtotalText =
        (await row.locator(".product-subtotal").textContent()) || "0";

      items.push({
        name: name.trim(),
        price: this.parsePrice(priceText),
        quantity: parseInt(quantityValue) || 1,
        subtotal: this.parsePrice(subtotalText),
      });
    }

    return items;
  }

  parsePrice(priceString: string): number {
    const cleaned = priceString.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  }

  async verifyItemSubtotals(): Promise<{ valid: boolean; details: string[] }> {
    const items = await this.getCartItems();
    const details: string[] = [];
    let valid = true;

    for (const item of items) {
      const expectedSubtotal = item.price * item.quantity;
      const isCorrect = Math.abs(item.subtotal - expectedSubtotal) < 0.01;

      details.push(
        `${item.name}: ${item.price} × ${
          item.quantity
        } = ${expectedSubtotal} (Actual: ${item.subtotal}) - ${
          isCorrect ? "✓" : "✗"
        }`
      );

      if (!isCorrect) {
        valid = false;
      }
    }

    return { valid, details };
  }

  async getSubtotal(): Promise<number> {
    const text = await this.subtotalPrice.textContent();
    return this.parsePrice(text || "0");
  }

  async getShippingCost(): Promise<number> {
    if (await this.shippingPrice.isVisible()) {
      const text = await this.shippingPrice.textContent();
      return this.parsePrice(text || "0");
    }
    return 0;
  }

  async getTax(): Promise<number> {
    if (await this.taxPrice.isVisible()) {
      const text = await this.taxPrice.textContent();
      return this.parsePrice(text || "0");
    }
    return 0;
  }

  async getTotal(): Promise<number> {
    const text = await this.totalPrice.textContent();
    return this.parsePrice(text || "0");
  }

  async verifyTotalCalculation(): Promise<{ valid: boolean; details: string }> {
    const items = await this.getCartItems();
    const calculatedSubtotal = items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const displayedSubtotal = await this.getSubtotal();
    const shipping = await this.getShippingCost();
    const tax = await this.getTax();
    const total = await this.getTotal();

    const expectedTotal = displayedSubtotal + shipping + tax;
    const valid = Math.abs(total - expectedTotal) < 0.01;

    const details = `
      Items Subtotal: ${calculatedSubtotal.toFixed(2)}
      Displayed Subtotal: ${displayedSubtotal.toFixed(2)}
      Shipping: ${shipping.toFixed(2)}
      Tax: ${tax.toFixed(2)}
      Expected Total: ${expectedTotal.toFixed(2)}
      Actual Total: ${total.toFixed(2)}
      Valid: ${valid ? "✓" : "✗"}
    `;

    return { valid, details };
  }

  async updateItemQuantity(
    itemIndex: number,
    newQuantity: number
  ): Promise<void> {
    const qtyInput = this.cartItems.nth(itemIndex).locator(".qty-input");
    await qtyInput.clear();
    await qtyInput.fill(newQuantity.toString());
    await this.updateCartButton.click();
    await this.waitForPageLoad();
  }

  async removeItem(itemIndex: number): Promise<void> {
    await this.removeCheckboxes.nth(itemIndex).check();
    await this.updateCartButton.click();
    await this.waitForPageLoad();
  }

  async proceedToCheckout(): Promise<void> {
    await this.termsCheckbox.check();
    await this.checkoutButton.click();
    await this.waitForPageLoad();
  }

  async applyDiscountCode(code: string): Promise<void> {
    await this.discountCode.fill(code);
    await this.applyDiscountButton.click();
    await this.waitForPageLoad();
  }
}
