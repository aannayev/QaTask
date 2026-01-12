import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

interface BillingAddress {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  country: string;
  state?: string;
  city: string;
  address1: string;
  address2?: string;
  zip: string;
  phone: string;
  fax?: string;
}

export class CheckoutPage extends BasePage {
  // Step indicators
  readonly billingAddressStep: Locator;
  readonly shippingAddressStep: Locator;
  readonly shippingMethodStep: Locator;
  readonly paymentMethodStep: Locator;
  readonly paymentInfoStep: Locator;
  readonly confirmOrderStep: Locator;

  // Billing Address fields
  readonly billingFirstName: Locator;
  readonly billingLastName: Locator;
  readonly billingEmail: Locator;
  readonly billingCompany: Locator;
  readonly billingCountry: Locator;
  readonly billingState: Locator;
  readonly billingCity: Locator;
  readonly billingAddress1: Locator;
  readonly billingAddress2: Locator;
  readonly billingZip: Locator;
  readonly billingPhone: Locator;
  readonly billingFax: Locator;
  readonly billingAddressDropdown: Locator;

  // Shipping same as billing checkbox
  readonly shipToSameAddress: Locator;

  // Navigation buttons
  readonly billingContinueButton: Locator;
  readonly shippingContinueButton: Locator;
  readonly shippingMethodContinueButton: Locator;
  readonly paymentMethodContinueButton: Locator;
  readonly paymentInfoContinueButton: Locator;
  readonly confirmOrderButton: Locator;

  // Payment methods
  readonly paymentMethodRadios: Locator;

  // Shipping methods
  readonly shippingMethodRadios: Locator;

  // Order confirmation
  readonly orderConfirmationMessage: Locator;
  readonly orderNumber: Locator;

  // Order totals in confirm step
  readonly confirmSubtotal: Locator;
  readonly confirmShipping: Locator;
  readonly confirmTax: Locator;
  readonly confirmTotal: Locator;

  constructor(page: Page) {
    super(page);

    // Steps
    this.billingAddressStep = page.locator("#opc-billing");
    this.shippingAddressStep = page.locator("#opc-shipping");
    this.shippingMethodStep = page.locator("#opc-shipping_method");
    this.paymentMethodStep = page.locator("#opc-payment_method");
    this.paymentInfoStep = page.locator("#opc-payment_info");
    this.confirmOrderStep = page.locator("#opc-confirm_order");

    // Billing fields
    this.billingFirstName = page.locator("#BillingNewAddress_FirstName");
    this.billingLastName = page.locator("#BillingNewAddress_LastName");
    this.billingEmail = page.locator("#BillingNewAddress_Email");
    this.billingCompany = page.locator("#BillingNewAddress_Company");
    this.billingCountry = page.locator("#BillingNewAddress_CountryId");
    this.billingState = page.locator("#BillingNewAddress_StateProvinceId");
    this.billingCity = page.locator("#BillingNewAddress_City");
    this.billingAddress1 = page.locator("#BillingNewAddress_Address1");
    this.billingAddress2 = page.locator("#BillingNewAddress_Address2");
    this.billingZip = page.locator("#BillingNewAddress_ZipPostalCode");
    this.billingPhone = page.locator("#BillingNewAddress_PhoneNumber");
    this.billingFax = page.locator("#BillingNewAddress_FaxNumber");
    this.billingAddressDropdown = page.locator("#billing-address-select");

    // Shipping checkbox
    this.shipToSameAddress = page.locator("#ShipToSameAddress");

    // Continue buttons for each step
    this.billingContinueButton = page.locator(
      '#billing-buttons-container input[type="button"]'
    );
    this.shippingContinueButton = page.locator(
      '#shipping-buttons-container input[type="button"]'
    );
    this.shippingMethodContinueButton = page.locator(
      '#shipping-method-buttons-container input[type="button"]'
    );
    this.paymentMethodContinueButton = page.locator(
      '#payment-method-buttons-container input[type="button"]'
    );
    this.paymentInfoContinueButton = page.locator(
      '#payment-info-buttons-container input[type="button"]'
    );
    this.confirmOrderButton = page.locator(
      '#confirm-order-buttons-container input[type="button"]'
    );

    // Payment methods
    this.paymentMethodRadios = page.locator('input[name="paymentmethod"]');

    // Shipping methods
    this.shippingMethodRadios = page.locator('input[name="shippingoption"]');

    // Order confirmation elements
    this.orderConfirmationMessage = page.locator(".section.order-completed");
    this.orderNumber = page.locator(".order-number strong");

    // Order totals in confirm step
    this.confirmSubtotal = page.locator(
      ".cart-total .order-subtotal .product-price"
    );
    this.confirmShipping = page.locator(
      ".cart-total .shipping-cost .product-price"
    );
    this.confirmTax = page.locator(".cart-total .tax-value .product-price");
    this.confirmTotal = page.locator(".cart-total .order-total .product-price");
  }

  async navigate(): Promise<void> {
    await this.navigateTo("/onepagecheckout");
    await this.waitForPageLoad();
  }

  async fillBillingAddress(address: BillingAddress): Promise<void> {
    if (await this.billingAddressDropdown.isVisible()) {
      const options = await this.billingAddressDropdown
        .locator("option")
        .count();
      if (options > 1) {
        // Use new address option
        await this.billingAddressDropdown.selectOption({
          label: "New Address",
        });
        await this.page.waitForTimeout(500);
      }
    }

    // Fill the form only if fields are visible (new address form)
    if (await this.billingFirstName.isVisible()) {
      await this.billingFirstName.fill(address.firstName);
      await this.billingLastName.fill(address.lastName);
      await this.billingEmail.fill(address.email);

      if (address.company) {
        await this.billingCompany.fill(address.company);
      }

      await this.billingCountry.selectOption({ label: address.country });
      await this.page.waitForTimeout(500); // Wait for state dropdown to populate

      if (address.state && (await this.billingState.isVisible())) {
        await this.billingState.selectOption({ label: address.state });
      }

      await this.billingCity.fill(address.city);
      await this.billingAddress1.fill(address.address1);

      if (address.address2) {
        await this.billingAddress2.fill(address.address2);
      }

      await this.billingZip.fill(address.zip);
      await this.billingPhone.fill(address.phone);

      if (address.fax) {
        await this.billingFax.fill(address.fax);
      }
    }
  }

  async continueBilling(): Promise<void> {
    await this.billingContinueButton.click();
    await this.page.waitForTimeout(2000);
    await this.shippingMethodStep
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});
  }

  async continueShipping(): Promise<void> {
    await this.shippingContinueButton.click();
    await this.page.waitForTimeout(1000);
  }

  async selectShippingMethod(method: string): Promise<void> {
    await this.page.waitForTimeout(1000);

    const shippingRadio = this.page
      .locator('input[name="shippingoption"]')
      .first();
    if (await shippingRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shippingRadio.check();
    }
  }

  async continueShippingMethod(): Promise<void> {
    await this.shippingMethodContinueButton
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});

    if (await this.shippingMethodContinueButton.isVisible()) {
      await this.shippingMethodContinueButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  async selectPaymentMethod(method: string): Promise<void> {
    await this.page.waitForTimeout(1000);

    const methodRadio = this.page
      .locator(`input[name="paymentmethod"]`)
      .first();

    if (await methodRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
      await methodRadio.check();
    }
  }

  async continuePaymentMethod(): Promise<void> {
    await this.paymentMethodContinueButton
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});

    if (await this.paymentMethodContinueButton.isVisible()) {
      await this.paymentMethodContinueButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  async continuePaymentInfo(): Promise<void> {
    await this.paymentInfoContinueButton
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});

    if (await this.paymentInfoContinueButton.isVisible()) {
      await this.paymentInfoContinueButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  async getOrderTotals(): Promise<{
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  }> {
    const subtotal = this.parsePrice(
      (await this.confirmSubtotal.textContent()) || "0"
    );
    const shipping = (await this.confirmShipping.isVisible())
      ? this.parsePrice((await this.confirmShipping.textContent()) || "0")
      : 0;
    const tax = (await this.confirmTax.isVisible())
      ? this.parsePrice((await this.confirmTax.textContent()) || "0")
      : 0;
    const total = this.parsePrice(
      (await this.confirmTotal.textContent()) || "0"
    );

    return { subtotal, shipping, tax, total };
  }

  parsePrice(priceString: string): number {
    const cleaned = priceString.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  }

  async verifyOrderTotalCalculation(): Promise<{
    valid: boolean;
    details: string;
  }> {
    const totals = await this.getOrderTotals();
    const expectedTotal = totals.subtotal + totals.shipping + totals.tax;
    const valid = Math.abs(totals.total - expectedTotal) < 0.01;

    const details = `
      Subtotal: $${totals.subtotal.toFixed(2)}
      Shipping: $${totals.shipping.toFixed(2)}
      Tax: $${totals.tax.toFixed(2)}
      Expected Total: $${expectedTotal.toFixed(2)}
      Actual Total: $${totals.total.toFixed(2)}
      Calculation Valid: ${valid ? "✓" : "✗"}
    `;

    return { valid, details };
  }

  async confirmOrder(): Promise<void> {
    await this.confirmOrderButton
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {});

    if (await this.confirmOrderButton.isVisible()) {
      await this.confirmOrderButton.click();
      await this.page.waitForTimeout(3000);
      await this.waitForPageLoad();
    }
  }

  async verifyOrderSuccess(): Promise<{
    success: boolean;
    orderNumber: string;
  }> {
    const success = await this.orderConfirmationMessage.isVisible();
    let orderNumber = "";

    if (success && (await this.orderNumber.isVisible())) {
      orderNumber = (await this.orderNumber.textContent()) || "";
    }

    return { success, orderNumber };
  }

  async completeCheckout(
    billingAddress: BillingAddress,
    shippingMethod: string = "Ground",
    paymentMethod: string = "Check"
  ): Promise<{ success: boolean; orderNumber: string }> {
    await this.fillBillingAddress(billingAddress);
    await this.continueBilling();

    await this.selectShippingMethod(shippingMethod);
    await this.continueShippingMethod();

    await this.selectPaymentMethod(paymentMethod);
    await this.continuePaymentMethod();

    await this.continuePaymentInfo();

    await this.confirmOrder();

    return await this.verifyOrderSuccess();
  }
}
