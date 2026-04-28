import type { Meta, StoryObj } from '@storybook/react-vite'
import { CustomersTableToolbar } from './CustomersTableToolbar'

const meta: Meta<typeof CustomersTableToolbar> = {
  title: 'Components/CustomersTableToolbar',
  component: CustomersTableToolbar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof CustomersTableToolbar>

export const Default: Story = {
  args: { search: '', sort: 'newest', filter: 'all', onSearchChange: () => {}, onSortChange: () => {}, onFilterChange: () => {} },
}
export const WithSearch: Story = {
  args: { ...Default.args, search: 'Jane' },
}
export const FilterActive: Story = {
  args: { ...Default.args, filter: 'active' },
}
export const SortOldest: Story = {
  args: { ...Default.args, sort: 'oldest' },
}
