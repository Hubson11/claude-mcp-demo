import { render, screen } from '@testing-library/react';
import { StatisticsSection, DEFAULT_TILES } from './StatisticsSection';

describe('StatisticsSection', () => {
  it('renders all 3 tiles when passed default tiles', () => {
    render(<StatisticsSection tiles={DEFAULT_TILES} />);
    expect(screen.getByTestId('stat-tile-0')).toBeInTheDocument();
    expect(screen.getByTestId('stat-tile-1')).toBeInTheDocument();
    expect(screen.getByTestId('stat-tile-2')).toBeInTheDocument();
  });

  it('renders correct value for each tile', () => {
    render(<StatisticsSection tiles={DEFAULT_TILES} />);
    expect(screen.getByTestId('stat-value-0')).toHaveTextContent('5,423');
    expect(screen.getByTestId('stat-value-1')).toHaveTextContent('1,893');
    expect(screen.getByTestId('stat-value-2')).toHaveTextContent('189');
  });

  it('renders trend row for tiles that have trend', () => {
    render(<StatisticsSection tiles={DEFAULT_TILES} />);
    expect(screen.getByTestId('stat-trend-0')).toBeInTheDocument();
    expect(screen.getByTestId('stat-trend-1')).toBeInTheDocument();
  });

  it('does NOT render trend row for tiles without trend', () => {
    render(<StatisticsSection tiles={DEFAULT_TILES} />);
    expect(screen.queryByTestId('stat-trend-2')).not.toBeInTheDocument();
  });

  it('renders avatars for the Active Now tile', () => {
    render(<StatisticsSection tiles={DEFAULT_TILES} />);
    const tile = screen.getByTestId('stat-tile-2');
    const avatars = tile.querySelectorAll('img[alt=""]');
    // icon + circle + 5 avatars
    expect(avatars.length).toBeGreaterThanOrEqual(5);
  });

  it('renders the section element', () => {
    render(<StatisticsSection tiles={DEFAULT_TILES} />);
    expect(screen.getByTestId('statistics-section')).toBeInTheDocument();
  });

  it('renders tile labels', () => {
    render(<StatisticsSection tiles={DEFAULT_TILES} />);
    expect(screen.getByText('Total Customers')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Active Now')).toBeInTheDocument();
  });
});
