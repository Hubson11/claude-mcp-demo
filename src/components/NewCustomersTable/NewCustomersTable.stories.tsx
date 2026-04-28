import type { Meta, StoryObj } from '@storybook/react-vite'
import { NewCustomersTable } from './NewCustomersTable'
import { mockCustomers } from '../../assets/mock/customers'

const meta: Meta<typeof NewCustomersTable> = {
  title: 'Components/NewCustomersTable',
  component: NewCustomersTable,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof NewCustomersTable>

export const Default: Story = {
  args: { customers: mockCustomers },
}
