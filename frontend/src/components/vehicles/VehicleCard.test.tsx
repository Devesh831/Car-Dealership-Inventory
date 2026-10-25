import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VehicleCard } from './VehicleCard';
import type { Vehicle } from '../../lib/api';

const vehicle: Vehicle = {
  id: 1,
  make: 'Toyota',
  model: 'Camry',
  year: 2024,
  category: 'Sedan',
  price: 28000,
  quantity: 2,
  description: 'Test vehicle',
  image_url: '',
  created_at: '',
  updated_at: '',
};

const noop = () => undefined;

afterEach(cleanup);

describe('VehicleCard', () => {
  it('disables purchase when the vehicle is out of stock', () => {
    render(
      <VehicleCard
        vehicle={{ ...vehicle, quantity: 0 }}
        isAdmin={false}
        onPurchase={noop}
        onRestock={noop}
        onEdit={noop}
        onDelete={noop}
      />
    );

    expect(screen.getByRole('button', { name: /buy/i }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('Out of stock')).toBeTruthy();
  });

  it('shows purchase controls to a regular user without admin actions', () => {
    render(
      <VehicleCard
        vehicle={vehicle}
        isAdmin={false}
        onPurchase={noop}
        onRestock={noop}
        onEdit={noop}
        onDelete={noop}
      />
    );

    expect(screen.getByRole('button', { name: /buy/i })).toBeTruthy();
    expect(screen.queryByTitle('Restock')).toBeNull();
    expect(screen.queryByTitle('Edit')).toBeNull();
    expect(screen.queryByTitle('Delete')).toBeNull();
  });

  it('shows admin actions and invokes the selected vehicle callback', () => {
    const onRestock = vi.fn();
    render(
      <VehicleCard
        vehicle={vehicle}
        isAdmin={true}
        onPurchase={noop}
        onRestock={onRestock}
        onEdit={noop}
        onDelete={noop}
      />
    );

    fireEvent.click(screen.getByTitle('Restock'));
    expect(onRestock).toHaveBeenCalledWith(vehicle);
    expect(screen.getByTitle('Edit')).toBeTruthy();
    expect(screen.getByTitle('Delete')).toBeTruthy();
  });
});
