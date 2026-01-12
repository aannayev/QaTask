# QA Automation Assignment

## 📋 Overview

This project contains automated tests for [Demo Web Shop](https://demowebshop.tricentis.com) as part of the Senior QA Automation Engineer assignment.

### Project Structure

```
qa-automation-assignment/
├── src/
│   ├── pages/              # Page Object Model classes
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── ProductPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── index.ts
│   ├── data/               # Test data files
│   │   └── testData.json
│   └── utils/              # Utility functions
│       ├── DataReader.ts
│       ├── testFixtures.ts
│       └── index.ts
├── tests/                  # Test specifications
│   └── placeOrder.spec.ts
├── postman/                # Postman API collections
│   └── PetStore_API_Collection.json
├── manual-tests/           # Manual test cases
│   └── ManualTestCases.md
├── docs/                   # Documentation
│   ├── PerformanceTestPlan.md
│   └── AI_Tools_Usage.md
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd qa-automation-assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your credentials
   # You need to register at https://demowebshop.tricentis.com/register
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DEMO_SHOP_EMAIL` | Your registered email | Register at [Demo Web Shop](https://demowebshop.tricentis.com/register) |
| `DEMO_SHOP_PASSWORD` | Your account password | Set during registration |

**Example `.env` file:**
```env
DEMO_SHOP_EMAIL=your_email@example.com
DEMO_SHOP_PASSWORD=your_secure_password
```

⚠️ **Important:** Never commit your `.env` file to version control!

---

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with UI (Headed Mode)
```bash
npm run test:headed
```

### Run Tests with Playwright UI
```bash
npm run test:ui
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Specific Test File
```bash
npx playwright test tests/placeOrder.spec.ts
```

### Run Tests by Tag
```bash
# Run only e2e tests
npx playwright test --grep @e2e
```

---

## 📊 Test Reports

### HTML Report (Built-in)
```bash
# View the HTML report after test run
npm run report
```

### Allure Report
```bash
# Generate Allure report
npm run allure:generate

# Open Allure report
npm run allure:open

# Or serve directly
npm run allure:serve
```

---

## 📁 Test Data

Test data is stored in `src/data/testData.json` and includes:
- Product information (names, URLs, prices)
- Shipping address details
- Payment and shipping method options

The test data is loaded at runtime and credentials are fetched from environment variables.

---

## 🏗️ Project Architecture

### Page Object Model (POM)

The project follows the Page Object Model design pattern:

- **BasePage**: Common functionality shared across all pages
- **LoginPage**: Authentication-related actions
- **ProductPage**: Product selection and cart operations
- **CartPage**: Shopping cart management and price verification
- **CheckoutPage**: Complete checkout flow handling

### Key Features

✅ **External Data**: Test data loaded from JSON files  
✅ **Environment Variables**: Credentials stored securely  
✅ **Page Object Model**: Clean separation of concerns  
✅ **Multiple Reporters**: HTML + Allure reports  
✅ **Price Calculations**: Automated verification of prices  
✅ **Cross-browser Testing**: Chrome, Firefox, Safari  

---

## 📝 Test Cases

### UI Automation Tests (Playwright)

| Test ID | Test Case | Description |
|---------|-----------|-------------|
| TC001 | Add multiple products to cart | Verifies adding different products to cart |
| TC002 | Verify price calculations | Validates subtotal and total calculations |
| TC003 | Complete checkout process | E2E test for full order placement |
| TC004 | Price consistency check | Compares product page prices with cart |
| TC005 | Quantity update calculation | Verifies price updates on quantity change |
| TC006 | Checkout confirmation totals | Validates final order totals |

---

## 🔌 API Testing (Postman)

The Postman collection is located at `postman/PetStore_API_Collection.json`

**Total: 35 test cases** covering CRUD operations for PetStore API

### Importing Collection

1. Open Postman
2. Click **Import**
3. Select the `PetStore_API_Collection.json` file
4. Run the collection using Collection Runner

### API Endpoints Tested

| Endpoint | Method | Test Cases | Description |
|----------|--------|------------|-------------|
| `/pet` | POST | TC01-TC10 | Create new pet with validations |
| `/pet/{petId}` | GET | TC11-TC15 | Retrieve pet by ID |
| `/pet` | PUT | TC16-TC20 | Update existing pet |
| `/pet/{petId}` | DELETE | TC21-TC25 | Delete pet by ID |
| `/pet/findByStatus` | GET | TC26-TC30 | Find pets by status |
| Error Handling | Various | TC31-TC35 | Invalid requests and edge cases |

### Test Coverage

- ✅ Positive scenarios (valid data)
- ✅ Negative scenarios (invalid/missing data)
- ✅ Boundary testing
- ✅ Response validation (status codes, headers, body)
- ✅ Schema validation

---

## 📋 Manual Test Cases

Manual test cases are documented in `manual-tests/ManualTestCases.md`

---

## 📈 Performance Testing

Performance test plan is documented in `docs/PerformanceTestPlan.md`

---

## 🤖 AI Tools Usage (Bonus)

Documentation on using AI tools for development acceleration is in `docs/AI_Tools_Usage.md`

---

## 🛠️ Troubleshooting

### Common Issues

1. **Tests skipped due to missing credentials**
   - Ensure `.env` file exists with valid credentials
   - Register at https://demowebshop.tricentis.com/register

2. **Playwright browsers not installed**
   ```bash
   npx playwright install
   ```

3. **Allure not found**
   ```bash
   npm install -g allure-commandline
   ```

---

## 👤 Author

**QA Automation Engineer**

This project demonstrates proficiency in:
- Test automation with Playwright and TypeScript
- API testing with Postman
- Page Object Model design pattern
- Test reporting (Allure, HTML)
- Performance test planning
- Manual test case design

---

## 📄 License

This project is created for demonstration purposes as part of a technical assessment.
