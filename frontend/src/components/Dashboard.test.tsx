import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dashboard } from './Dashboard';

const mocks = vi.hoisted(() => ({
  user: null as null | { username: string; role: 'user' | 'admin' },
  fetchVehicles: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mocks.user, logout: vi.fn() }),
}));

vi.mock('../hooks/useVehicles', () => ({
  useVehicles: () => ({
    vehicles: [],
    pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
    isLoading: false,
    error: null,
    fetchVehicles: mocks.fetchVehicles,
    searchVehicles: vi.fn(),
    createVehicle: vi.fn(),
    updateVehicle: vi.fn(),
    deleteVehicle: vi.fn(),
    purchaseVehicle: vi.fn(),
    restockVehicle: vi.fn(),
  }),
}));

afterEach(cleanup);

beforeEach(() => {
  mocks.fetchVehicles.mockReset();
  mocks.fetchVehicles.mockResolvedValue(undefined);
});

describe('Dashboard role controls', () => {
  it('shows the admin dashboard action to an admin', () => {
    mocks.user = { username: 'dealer-admin', role: 'admin' };
    render(<Dashboard />);

    expect(screen.getByText('Admin')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    expect(screen.getByText('Add New Vehicle')).toBeTruthy();
  });

  it('does not show the add action to a regular user', () => {
    mocks.user = { username: 'customer', role: 'user' };
    render(<Dashboard />);

    expect(screen.queryByRole('button', { name: /add vehicle/i })).toBeNull();
    expect(mocks.fetchVehicles).toHaveBeenCalledWith(1);
  });
});
