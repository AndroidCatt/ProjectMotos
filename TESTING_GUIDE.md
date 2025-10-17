# 🧪 Guía de Testing Automatizado v16.0

## Setup Testing

### Instalar Dependencias

```bash
# Jest para unit tests
npm install --save-dev jest @babel/preset-env

# Cypress para E2E tests
npm install --save-dev cypress

# Testing Library
npm install --save-dev @testing-library/dom @testing-library/jest-dom
```

### Configurar package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress open",
    "test:e2e:headless": "cypress run"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "coveragePathIgnorePatterns": ["/node_modules/"]
  }
}
```

### jest.setup.js

```javascript
require('@testing-library/jest-dom');
```

### cypress.config.js

```javascript
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false
  }
}
```

## Ejemplos de Tests

### Unit Test - Inventario

```javascript
// __tests__/inventory.test.js
describe('Inventory System', () => {
  let inventory;

  beforeEach(() => {
    inventory = new InventorySystemIntelligent();
  });

  test('should check stock levels correctly', () => {
    const alerts = inventory.checkStockLevels();
    expect(Array.isArray(alerts)).toBe(true);
  });

  test('should add movement correctly', () => {
    const movement = inventory.addMovement('test-sku', 10, 'in', 'Test');
    expect(movement.quantity).toBe(10);
    expect(movement.type).toBe('in');
  });
});
```

### E2E Test - Cypress

```javascript
// cypress/e2e/checkout.cy.js
describe('Checkout Flow', () => {
  it('should complete purchase', () => {
    cy.visit('/')
    cy.contains('Comenzar').click()
    cy.get('#user-input').type('busco llantas')
    cy.get('#send-btn').click()
    // Add more assertions...
  })
})
```

## Ejecutar Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```
