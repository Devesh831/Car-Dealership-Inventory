import { useState, useEffect, type FormEvent } from 'react';
import type { Vehicle, VehicleCategory } from '../../lib/api';

const CATEGORIES: VehicleCategory[] = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Van', 'Electric', 'Hybrid'];
const CURRENT_YEAR = new Date().getFullYear();

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  onCancel: () => void;
}

export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  price: number;
  quantity: number;
  description: string;
  image_url: string;
}

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [form, setForm] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: CURRENT_YEAR,
    category: 'Sedan',
    price: 0,
    quantity: 0,
    description: '',
    image_url: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setForm({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        price: vehicle.price,
        quantity: vehicle.quantity,
        description: vehicle.description || '',
        image_url: vehicle.image_url || '',
      });
    }
  }, [vehicle]);

  const set =
    (field: keyof VehicleFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: ['price', 'quantity', 'year'].includes(field) ? Number(val) : val,
      }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.price <= 0) { setError('Price must be greater than 0'); return; }
    if (form.quantity < 0) { setError('Quantity cannot be negative'); return; }

    setIsLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Make *</label>
          <input type="text" className="input" placeholder="Toyota" value={form.make}
            onChange={set('make')} required />
        </div>
        <div>
          <label className="input-label">Model *</label>
          <input type="text" className="input" placeholder="Camry" value={form.model}
            onChange={set('model')} required />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="input-label">Year *</label>
          <input type="number" className="input" min={1900} max={CURRENT_YEAR + 1}
            value={form.year} onChange={set('year')} required />
        </div>
        <div>
          <label className="input-label">Category *</label>
          <select className="select" value={form.category} onChange={set('category')} required>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Quantity *</label>
          <input type="number" className="input" min={0} value={form.quantity}
            onChange={set('quantity')} required />
        </div>
      </div>

      <div>
        <label className="input-label">Price (USD) *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input type="number" className="input pl-7" min={0.01} step={0.01}
            placeholder="0.00" value={form.price || ''} onChange={set('price')} required />
        </div>
      </div>

      <div>
        <label className="input-label">Description</label>
        <textarea className="input resize-none h-20" placeholder="Vehicle description…"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
      </div>

      <div>
        <label className="input-label">Image URL</label>
        <input type="url" className="input" placeholder="https://example.com/car.jpg"
          value={form.image_url} onChange={set('image_url')} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
          {isLoading ? 'Saving…' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
}
