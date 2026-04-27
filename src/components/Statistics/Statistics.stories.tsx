import type { Meta, StoryObj } from '@storybook/react-vite'
import { Statistics } from './Statistics'

const meta: Meta<typeof Statistics> = {
  title: 'Components/Statistics',
  component: Statistics,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}
export default meta

type Story = StoryObj<typeof Statistics>

export const Default: Story = {
  args: {
    totalCustomers: 5423,
    totalCustomersChange: 16,
    members: 1893,
    membersChange: -1,
    activeNow: 189,
  },
}

export const AllPositive: Story = {
  args: {
    ...Default.args,
    membersChange: 8,
  },
}

export const AllNegative: Story = {
  args: {
    ...Default.args,
    totalCustomersChange: -5,
    membersChange: -12,
  },
}
