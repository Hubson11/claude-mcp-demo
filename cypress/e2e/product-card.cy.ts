// TODO: E2E tests to be implemented by Claude during demo
describe('ProductCard', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('displays product cards on the page', () => {
    cy.get('[data-testid="product-card"]').should('exist')
  })

  it('adds product to cart when button is clicked', () => {
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="add-to-cart-btn"]').click()
    })
    cy.get('[data-testid="cart-count"]').should('contain', '1')
  })

  it('shows sale badge when product is on sale', () => {
    cy.get('[data-testid="product-card"]').first()
      .find('[data-testid="badge"]')
      .should('contain', 'Sale')
  })
})
