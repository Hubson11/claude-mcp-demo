import type { Meta, StoryObj } from '@storybook/react'
import { CustomersTable } from './CustomersTable'
import { mockCustomers } from '../../assets/mock/customers'

const meta: Meta<typeof CustomersTable> = {
  title: 'Components/CustomersTable',
  component: CustomersTable,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof CustomersTable>

export const Default: Story = {
  args: { customers: mockCustomers },
}
