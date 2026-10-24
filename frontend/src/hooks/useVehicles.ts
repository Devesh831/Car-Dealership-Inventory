import { useState, useCallback } from 'react';
import { vehicleApi, type Vehicle, type PaginatedVehicles, type SearchFilters } from '../lib/api';

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  pagination: Omit<PaginatedVehicles, 'data'> | null;
  isLoading: boolean;
  error: string | null;
  fetchVehicles: (page?: number, limit?: number) => Promise<void>;
  searchVehicles: (filters: SearchFilters) => Promise<void>;
  createVehicle: (data: Parameters<typeof vehicleApi.create>[0]) => Promise<Vehicle>;
  updateVehicle: (id: number, data: Partial<Parameters<typeof vehicleApi.create>[0]>) => Promise<Vehicle>;
  deleteVehicle: (id: number) => Promise<void>;
  purchaseVehicle: (id: number, qty: number) => Promise<Vehicle>;
  restockVehicle: (id: number, qty: number) => Promise<Vehicle>;
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

export function useVehicles(): UseVehiclesReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedVehicles, 'data'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async (page = 1, limit = 12) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await vehicleApi.getAll(page, limit);
      setVehicles(res.data.data);
      const { data: _d, ...pag } = res.data;
      setPagination(pag);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchVehicles = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await vehicleApi.search(filters);
      setVehicles(res.data.data);
      const { data: _d, ...pag } = res.data;
      setPagination(pag);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVehicle = useCallback(async (data: Parameters<typeof vehicleApi.create>[0]) => {
    const res = await vehicleApi.create(data);
    return res.data.vehicle;
  }, []);

  const updateVehicle = useCallback(async (id: number, data: Partial<Parameters<typeof vehicleApi.create>[0]>) => {
    const res = await vehicleApi.update(id, data);
    setVehicles((prev) => prev.map((v) => (v.id === id ? res.data.vehicle : v)));
    return res.data.vehicle;
  }, []);

  const deleteVehicle = useCallback(async (id: number) => {
    await vehicleApi.delete(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const purchaseVehicle = useCallback(async (id: number, qty: number) => {
    const res = await vehicleApi.purchase(id, qty);
    setVehicles((prev) => prev.map((v) => (v.id === id ? res.data.vehicle : v)));
    return res.data.vehicle;
  }, []);

  const restockVehicle = useCallback(async (id: number, qty: number) => {
    const res = await vehicleApi.restock(id, qty);
    setVehicles((prev) => prev.map((v) => (v.id === id ? res.data.vehicle : v)));
    return res.data.vehicle;
  }, []);

  return {
    vehicles,
    pagination,
    isLoading,
    error,
    fetchVehicles,
    searchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    purchaseVehicle,
    restockVehicle,
    setVehicles,
  };
}
