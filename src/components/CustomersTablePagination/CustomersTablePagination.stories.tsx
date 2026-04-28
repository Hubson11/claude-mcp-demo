import type { Meta, StoryObj } from '@storybook/react'
import { CustomersTablePagination } from './CustomersTablePagination'

const meta: Meta<typeof CustomersTablePagination> = {
  title: 'Components/CustomersTablePagination',
  component: CustomersTablePagination,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof CustomersTablePagination>

export const Default: Story = {
  args: { currentPage: 1, totalPages: 42, totalItems: 336, itemsPerPage: 8, onPageChange: () => {} },
}
export const MiddlePage: Story = {
  args: { ...Default.args, currentPage: 20 },
}
export const LastPage: Story = {
  args: { ...Default.args, currentPage: 42 },
}
export const FewPages: Story = {
  args: { currentPage: 2, totalPages: 5, totalItems: 40, itemsPerPage: 8, onPageChange: () => {} },
}
