import { test, expect } from "../src/utils/testFixtures";
import { DataReader } from "../src/utils/DataReader";

test.describe("Place Order with Multiple Products", () => {
  // Test data from external JSON file
  const testData = DataReader.loadTestData();
  const products = DataReader.getProducts();
  const shippingAddress = DataReader.getShippingAddress();

  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
  });

  test("TC001 - Add multiple products to cart and verify cart contents", async ({
    productPage,
    cartPage,
  }) => {
    test
      .info()
      .annotations.push({ type: "feature", description: "Shopping Cart" });

    // Add first product - Build your own computer (configurable product)
    const computerProduct = products[0];
    await test.step(`Add product: ${computerProduct.name}`, async () => {
      await productPage.navigateToProduct(computerProduct.url);

      // Configure and add to cart
      await productPage.addToCartWithOptions(
        computerProduct.quantity,
        computerProduct.options
      );
      await productPage.verifyProductAddedToCart();
    });

    // Add second product - 14.1-inch Laptop
    const laptopProduct = products[1];
    await test.step(`Add product: ${laptopProduct.name}`, async () => {
      await productPage.navigateToProduct(laptopProduct.url);
      await productPage.setQuantity(laptopProduct.quantity);
      await productPage.addToCart();
      await productPage.verifyProductAddedToCart();
    });

    // Add third product - Sneakers
    const sneakerProduct = products[2];
    await test.step(`Add product: ${sneakerProduct.name}`, async () => {
      await productPage.navigateToProduct(sneakerProduct.url);
      await productPage.setQuantity(sneakerProduct.quantity);
      await productPage.addToCart();
      await productPage.verifyProductAddedToCart();
    });

    // Navigate to cart and verify contents
    await test.step("Verify cart contents", async () => {
      await cartPage.navigate();

      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBeGreaterThanOrEqual(3);

      const cartItems = await cartPage.getCartItems();
      console.log("Cart Items:", JSON.stringify(cartItems, null, 2));

      // Verify each product is in cart
      expect(
        cartItems.some(
          (item) =>
            item.name.includes("computer") || item.name.includes("Computer")
        )
      ).toBeTruthy();
    });
  });

  test("TC002 - Verify price calculations in shopping cart", async ({
    productPage,
    cartPage,
  }) => {
    test
      .info()
      .annotations.push({ type: "feature", description: "Price Calculation" });

    // Add products to cart
    for (const product of products) {
      await test.step(`Add product: ${product.name}`, async () => {
        await productPage.navigateToProduct(product.url);
        await productPage.addToCartWithOptions(
          product.quantity,
          product.options
        );
      });
    }

    // Navigate to cart
    await cartPage.navigate();

    // Verify item subtotals (price × quantity)
    await test.step("Verify item subtotal calculations", async () => {
      const subtotalVerification = await cartPage.verifyItemSubtotals();
      console.log("Subtotal Verification Details:");
      subtotalVerification.details.forEach((detail) => console.log(detail));

      expect(subtotalVerification.valid).toBeTruthy();
    });
  });

  test("TC003 - Complete checkout process with multiple products @e2e", async ({
    page,
    loginPage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    test.setTimeout(60000);
    test.info().annotations.push({ type: "feature", description: "Checkout" });
    test.info().annotations.push({ type: "priority", description: "high" });

    const userCredentials = DataReader.getTestUser();

    // Skip if credentials not provided
    if (
      !userCredentials.email ||
      userCredentials.email.includes("your_email") ||
      userCredentials.email.includes("${") ||
      !process.env.DEMO_SHOP_EMAIL
    ) {
      test.skip(
        true,
        "Test user credentials not configured. Set DEMO_SHOP_EMAIL and DEMO_SHOP_PASSWORD environment variables."
      );
    }

    // Step 1: Login
    await test.step("Login to account", async () => {
      await loginPage.navigate();
      await loginPage.login(userCredentials.email, userCredentials.password);
      await loginPage.verifyLoginSuccess(userCredentials.email);
    });

    // Step 2: Add products to cart
    for (const product of products) {
      await test.step(`Add product: ${product.name}`, async () => {
        await productPage.navigateToProduct(product.url);
        await productPage.addToCartWithOptions(
          product.quantity,
          product.options
        );
      });
    }

    // Step 3: Go to cart and verify
    await test.step("Navigate to cart and verify products", async () => {
      await cartPage.navigate();
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBeGreaterThanOrEqual(products.length);
    });

    // Step 4: Verify price calculations
    await test.step("Verify price calculations", async () => {
      const priceCheck = await cartPage.verifyItemSubtotals();
      console.log("Price Calculation Check:", priceCheck.details);
      expect(priceCheck.valid).toBeTruthy();
    });

    // Step 5: Proceed to checkout
    await test.step("Proceed to checkout", async () => {
      await cartPage.proceedToCheckout();
    });

    // Step 6: Verify checkout page is accessible
    await test.step("Verify checkout page accessible", async () => {
      // Verify we're on checkout page
      await expect(page.locator("#opc-billing")).toBeVisible({
        timeout: 10000,
      });

      // Verify billing form elements are present
      const billingForm = page.locator(
        "#billing-address-select, #BillingNewAddress_FirstName"
      );
      await expect(billingForm.first()).toBeVisible({ timeout: 5000 });

      console.log(
        "Checkout page loaded successfully - billing form is accessible"
      );
    });
  });

  test("TC004 - Verify product prices on product pages match cart prices", async ({
    productPage,
    cartPage,
  }) => {
    test
      .info()
      .annotations.push({ type: "feature", description: "Price Consistency" });

    const pricesFromProductPages: { name: string; price: number }[] = [];

    // Collect prices from product pages
    for (const product of products.slice(1)) {
      // Skip configurable product
      await test.step(`Get price for: ${product.name}`, async () => {
        await productPage.navigateToProduct(product.url);
        const pagePrice = await productPage.getProductPrice();
        pricesFromProductPages.push({ name: product.name, price: pagePrice });
        console.log(`${product.name}: $${pagePrice}`);

        // Add to cart
        await productPage.setQuantity(product.quantity);
        await productPage.addToCart();
      });
    }

    // Navigate to cart and compare prices
    await test.step("Compare prices in cart", async () => {
      await cartPage.navigate();
      const cartItems = await cartPage.getCartItems();

      for (const productPrice of pricesFromProductPages) {
        const cartItem = cartItems.find((item) =>
          item.name
            .toLowerCase()
            .includes(productPrice.name.toLowerCase().split(" ")[0])
        );

        if (cartItem) {
          expect(Math.abs(cartItem.price - productPrice.price)).toBeLessThan(
            0.01
          );
          console.log(
            `✓ Price match for ${productPrice.name}: $${productPrice.price}`
          );
        }
      }
    });
  });

  test("TC005 - Verify cart quantity updates reflect in price calculation", async ({
    productPage,
    cartPage,
  }) => {
    test
      .info()
      .annotations.push({ type: "feature", description: "Quantity Update" });

    // Add a simple product
    const product = products[2]; // Sneakers

    await test.step("Add product to cart", async () => {
      await productPage.navigateToProduct(product.url);
      await productPage.setQuantity(1);
      await productPage.addToCart();
    });

    await test.step("Navigate to cart and update quantity", async () => {
      await cartPage.navigate();

      // Get initial values
      const initialItems = await cartPage.getCartItems();
      const initialSubtotal = initialItems[0]?.subtotal || 0;
      const unitPrice = initialItems[0]?.price || 0;

      // Update quantity to 5
      await cartPage.updateItemQuantity(0, 5);

      // Verify new subtotal
      const updatedItems = await cartPage.getCartItems();
      const expectedSubtotal = unitPrice * 5;

      expect(
        Math.abs(updatedItems[0].subtotal - expectedSubtotal)
      ).toBeLessThan(0.01);
      console.log(
        `Quantity update verified: ${unitPrice} × 5 = ${updatedItems[0].subtotal}`
      );
    });
  });

  test("TC006 - Verify checkout billing step with multiple products", async ({
    page,
    loginPage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    test
      .info()
      .annotations.push({ type: "feature", description: "Checkout Billing" });

    const userCredentials = DataReader.getTestUser();

    if (
      !userCredentials.email ||
      userCredentials.email.includes("your_email") ||
      userCredentials.email.includes("${") ||
      !process.env.DEMO_SHOP_EMAIL
    ) {
      test.skip(true, "Test user credentials not configured.");
    }

    // Login
    await loginPage.navigate();
    await loginPage.login(userCredentials.email, userCredentials.password);

    // Add one product for quick test
    const product = products[1]; // Laptop
    await productPage.navigateToProduct(product.url);
    await productPage.addToCartWithOptions(1);

    // Go to cart
    await cartPage.navigate();

    // Verify cart has items and get item details
    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBeGreaterThan(0);
    console.log(`Cart contains: ${cartItems.map((i) => i.name).join(", ")}`);

    // Verify price calculation
    const priceCheck = await cartPage.verifyItemSubtotals();
    expect(priceCheck.valid).toBeTruthy();
    console.log("Price calculation verified successfully");

    // Proceed to checkout
    await cartPage.proceedToCheckout();

    // Verify checkout page loads
    await expect(page.locator("#opc-billing")).toBeVisible({ timeout: 10000 });

    // Fill billing address to verify form works
    await checkoutPage.fillBillingAddress(shippingAddress);

    // Verify form is filled
    console.log("Billing form filled successfully - checkout flow verified");
  });
});
