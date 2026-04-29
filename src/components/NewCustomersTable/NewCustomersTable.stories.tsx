import type { Meta, StoryObj } from '@storybook/react-vite'
import { NewCustomersTable } from './NewCustomersTable'
import { mockCustomers } from '../../assets/mock/customers'

const meta: Meta<typeof NewCustomersTable> = {
  title: 'Components/NewCustomersTable',
  component: NewCustomersTable,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'responsive' },
    controls: { exclude: ['className'] },
  },
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof NewCustomersTable>

export const Default: Story = {
  args: { customers: mockCustomers },
}
