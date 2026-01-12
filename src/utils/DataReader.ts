import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

interface TestData {
  testUser: {
    email: string;
    password: string;
  };
  products: ProductData[];
  shippingAddress: ShippingAddress;
  paymentMethods: Record<string, string>;
  shippingMethods: Record<string, string>;
}

interface ProductData {
  name: string;
  category: string;
  url: string;
  basePrice: number;
  quantity: number;
  options?: {
    processor?: string;
    ram?: string;
    hdd?: string;
    os?: string;
    software?: string[];
  };
}

interface ShippingAddress {
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

export class DataReader {
  private static testData: TestData | null = null;

  static loadTestData(): TestData {
    if (this.testData) {
      return this.testData;
    }

    const dataPath = path.join(__dirname, "../data/testData.json");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    let data = JSON.parse(rawData) as TestData;

    data.testUser.email = process.env.DEMO_SHOP_EMAIL || data.testUser.email;
    data.testUser.password =
      process.env.DEMO_SHOP_PASSWORD || data.testUser.password;

    this.testData = data;
    return data;
  }

  static getTestUser(): { email: string; password: string } {
    const data = this.loadTestData();
    return {
      email: process.env.DEMO_SHOP_EMAIL || data.testUser.email,
      password: process.env.DEMO_SHOP_PASSWORD || data.testUser.password,
    };
  }

  static getProducts(): ProductData[] {
    const data = this.loadTestData();
    return data.products;
  }

  static getProductByName(name: string): ProductData | undefined {
    const products = this.getProducts();
    return products.find((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  static getShippingAddress(): ShippingAddress {
    const data = this.loadTestData();
    return data.shippingAddress;
  }

  static getPaymentMethods(): Record<string, string> {
    const data = this.loadTestData();
    return data.paymentMethods;
  }

  static getShippingMethods(): Record<string, string> {
    const data = this.loadTestData();
    return data.shippingMethods;
  }

  static calculateExpectedTotal(products: ProductData[]): number {
    return products.reduce((total, product) => {
      let productPrice = product.basePrice;

      if (product.options?.os?.includes("+50")) {
        productPrice += 50;
      }
      if (product.options?.software) {
        for (const sw of product.options.software) {
          if (sw.includes("+50")) {
            productPrice += 50;
          }
        }
      }

      return total + productPrice * product.quantity;
    }, 0);
  }
}

export { TestData, ProductData, ShippingAddress };
