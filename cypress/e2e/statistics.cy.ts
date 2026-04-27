describe('Statistics section', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('renders the statistics container', () => {
    cy.get('[data-testid="statistics"]').should('be.visible')
  })

  it('shows Total Customers stat', () => {
    cy.get('[data-testid="stat-total-customers"]').should('be.visible')
    cy.get('[data-testid="stat-total-customers"]').contains('Total Customers')
    cy.get('[data-testid="stat-total-customers"]').contains('5,423')
  })

  it('shows Members stat', () => {
    cy.get('[data-testid="stat-members"]').should('be.visible')
    cy.get('[data-testid="stat-members"]').contains('Members')
    cy.get('[data-testid="stat-members"]').contains('1,893')
  })

  it('shows Active Now stat', () => {
    cy.get('[data-testid="stat-active-now"]').should('be.visible')
    cy.get('[data-testid="stat-active-now"]').contains('Active Now')
    cy.get('[data-testid="stat-active-now"]').contains('189')
  })
})
