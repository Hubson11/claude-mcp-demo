import { Statistics } from './components/Statistics'

function App() {
  return (
    <div style={{ padding: 40, background: '#f5f7fa', minHeight: '100vh' }}>
      <Statistics
        totalCustomers={5423}
        totalCustomersChange={16}
        members={1893}
        membersChange={-1}
        activeNow={189}
      />
    </div>
  )
}

export default App;
