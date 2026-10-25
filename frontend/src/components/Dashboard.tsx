import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../hooks/useVehicles';
import { VehicleCard } from './vehicles/VehicleCard';
import { VehicleForm, type VehicleFormData } from './vehicles/VehicleForm';
import { SearchFilterBar, type SearchFiltersState } from './vehicles/SearchFilterBar';
import { Pagination } from './ui/Pagination';
import { Modal } from './ui/Modal';
import type { Vehicle } from '../lib/api';

const EMPTY_FILTERS: SearchFiltersState = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

export function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
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
  } = useVehicles();

  // UI state
  const [filters, setFilters] = useState<SearchFiltersState>(EMPTY_FILTERS);
  const [isSearching, setIsSearching] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicleTarget, setDeleteVehicleTarget] = useState<Vehicle | null>(null);
  const [purchaseTarget, setPurchaseTarget] = useState<Vehicle | null>(null);
  const [restockTarget, setRestockTarget] = useState<Vehicle | null>(null);
  const [quantityInput, setQuantityInput] = useState('1');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load vehicles on first render
  useEffect(() => { void fetchVehicles(1); }, [fetchVehicles]);

  const handleSearch = async () => {
    setIsSearching(true);
    const { make, model, category, minPrice, maxPrice } = filters;
    if (!make && !model && !category && !minPrice && !maxPrice) {
      await fetchVehicles(1);
    } else {
      await searchVehicles({
        make: make || undefined,
        model: model || undefined,
        category: (category as Vehicle['category']) || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: 1,
      });
    }
    setIsSearching(false);
  };

  const handleClearFilters = async () => {
    setFilters(EMPTY_FILTERS);
    await fetchVehicles(1);
  };

  const handlePageChange = async (page: number) => {
    const { make, model, category, minPrice, maxPrice } = filters;
    if (!make && !model && !category && !minPrice && !maxPrice) {
      await fetchVehicles(page);
    } else {
      await searchVehicles({
        make: make || undefined,
        model: model || undefined,
        category: (category as Vehicle['category']) || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page,
      });
    }
  };

  // ─── Add vehicle ──────────────────────────────────────────────────────────
  const handleAddVehicle = async (data: VehicleFormData) => {
    await createVehicle(data);
    setAddModal(false);
    showToast(`${data.make} ${data.model} added to inventory!`);
    await fetchVehicles(pagination?.page || 1);
  };

  // ─── Edit vehicle ─────────────────────────────────────────────────────────
  const handleUpdateVehicle = async (data: VehicleFormData) => {
    if (!editVehicle) return;
    await updateVehicle(editVehicle.id, data);
    setEditVehicle(null);
    showToast('Vehicle updated successfully!');
  };

  // ─── Delete vehicle ───────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteVehicleTarget) return;
    setActionLoading(true);
    try {
      await deleteVehicle(deleteVehicleTarget.id);
      setDeleteVehicleTarget(null);
      showToast('Vehicle deleted successfully!');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Purchase vehicle ─────────────────────────────────────────────────────
  const handlePurchaseConfirm = async () => {
    if (!purchaseTarget) return;
    const qty = parseInt(quantityInput);
    if (isNaN(qty) || qty <= 0) { setActionError('Enter a valid quantity'); return; }
    setActionLoading(true);
    setActionError('');
    try {
      const updated = await purchaseVehicle(purchaseTarget.id, qty);
      setPurchaseTarget(null);
      showToast(`Purchased ${qty} × ${updated.make} ${updated.model}`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Purchase failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Restock vehicle ──────────────────────────────────────────────────────
  const handleRestockConfirm = async () => {
    if (!restockTarget) return;
    const qty = parseInt(quantityInput);
    if (isNaN(qty) || qty <= 0) { setActionError('Enter a valid quantity'); return; }
    setActionLoading(true);
    setActionError('');
    try {
      const updated = await restockVehicle(restockTarget.id, qty);
      setRestockTarget(null);
      showToast(`Restocked ${qty} unit(s) of ${updated.make} ${updated.model}`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Restock failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (setter: (v: Vehicle) => void, vehicle: Vehicle) => {
    setActionError('');
    setQuantityInput('1');
    setter(vehicle);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="page-container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.586-2.586A2 2 0 017 13h10a2 2 0 011.414.586L21 16V6a1 1 0 00-1-1h-2" />
              </svg>
            </div>
            <span className="font-bold text-white hidden sm:block">AutoDrive Inventory</span>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="badge-blue hidden sm:inline-flex">Admin</span>
            )}
            <span className="text-gray-400 text-sm hidden md:block">
              {user?.username}
            </span>
            <button onClick={logout} className="btn-secondary text-sm px-3 py-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="page-container py-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">Vehicle Inventory</h1>
            <p className="section-subtitle">
              {pagination ? `${pagination.total} vehicles in the system` : 'Loading…'}
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setAddModal(true)} className="btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vehicle
            </button>
          )}
        </div>

        {/* Search / filter bar */}
        <SearchFilterBar
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          isLoading={isSearching}
        />

        {/* Inventory stats */}
        {pagination && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Vehicles', value: pagination.total, color: 'text-brand-400' },
              { label: 'Page', value: `${pagination.page} / ${pagination.totalPages}`, color: 'text-purple-400' },
              {
                label: 'In Stock',
                value: vehicles.filter((v) => v.quantity > 0).length,
                color: 'text-emerald-400',
              },
              {
                label: 'Out of Stock',
                value: vehicles.filter((v) => v.quantity === 0).length,
                color: 'text-red-400',
              },
            ].map((stat) => (
              <div key={stat.label} className="card p-4">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Vehicle grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-72 skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => fetchVehicles(1)} className="btn-secondary">Retry</button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-16 h-16 text-surface-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-1">No vehicles found</h3>
            <p className="text-gray-400 text-sm">
              {isAdmin
                ? 'Add your first vehicle to start building the inventory, or adjust your search filters.'
                : 'There are no vehicles in the inventory yet. Please check back later or adjust your search filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isAdmin={isAdmin}
                onPurchase={(v) => openModal(setPurchaseTarget, v)}
                onRestock={(v) => openModal(setRestockTarget, v)}
                onEdit={setEditVehicle}
                onDelete={setDeleteVehicleTarget}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* ── Toast notification ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl
          animate-slide-in-right font-medium text-sm
          ${toast.type === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
          }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* ── Add Vehicle Modal ── */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New Vehicle" maxWidth="max-w-2xl">
        <VehicleForm onSubmit={handleAddVehicle} onCancel={() => setAddModal(false)} />
      </Modal>

      {/* ── Edit Vehicle Modal ── */}
      <Modal isOpen={!!editVehicle} onClose={() => setEditVehicle(null)} title="Edit Vehicle" maxWidth="max-w-2xl">
        <VehicleForm
          vehicle={editVehicle}
          onSubmit={handleUpdateVehicle}
          onCancel={() => setEditVehicle(null)}
        />
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={!!deleteVehicleTarget} onClose={() => setDeleteVehicleTarget(null)} title="Delete Vehicle">
        {deleteVehicleTarget && (
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to permanently delete{' '}
              <span className="text-white font-semibold">
                {deleteVehicleTarget.make} {deleteVehicleTarget.model} ({deleteVehicleTarget.year})
              </span>
              ? This action cannot be undone.
            </p>
            {actionError && <p className="text-red-400 text-sm">{actionError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setDeleteVehicleTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDeleteConfirm} className="btn-danger flex-1" disabled={actionLoading}>
                {actionLoading ? 'Deleting…' : 'Delete Vehicle'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Purchase Modal ── */}
      <Modal isOpen={!!purchaseTarget} onClose={() => setPurchaseTarget(null)} title="Purchase Vehicle">
        {purchaseTarget && (
          <div className="space-y-4">
            <div className="card p-4 bg-surface-elevated">
              <p className="font-semibold text-white">{purchaseTarget.make} {purchaseTarget.model} ({purchaseTarget.year})</p>
              <p className="text-brand-400 font-bold text-xl">${purchaseTarget.price.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">Available: {purchaseTarget.quantity} units</p>
            </div>
            <div>
              <label className="input-label">Quantity to purchase</label>
              <input type="number" className="input" min={1} max={purchaseTarget.quantity}
                value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} />
            </div>
            {actionError && <p className="text-red-400 text-sm">{actionError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setPurchaseTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePurchaseConfirm} className="btn-primary flex-1" disabled={actionLoading}>
                {actionLoading ? 'Processing…' : `Buy ${quantityInput} unit(s)`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Restock Modal (Admin) ── */}
      <Modal isOpen={!!restockTarget} onClose={() => setRestockTarget(null)} title="Restock Vehicle">
        {restockTarget && (
          <div className="space-y-4">
            <div className="card p-4 bg-surface-elevated">
              <p className="font-semibold text-white">{restockTarget.make} {restockTarget.model} ({restockTarget.year})</p>
              <p className="text-gray-400 text-sm">Current stock: {restockTarget.quantity} units</p>
            </div>
            <div>
              <label className="input-label">Units to add</label>
              <input type="number" className="input" min={1}
                value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} />
            </div>
            {actionError && <p className="text-red-400 text-sm">{actionError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setRestockTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleRestockConfirm} className="btn-success flex-1" disabled={actionLoading}>
                {actionLoading ? 'Restocking…' : `Add ${quantityInput} unit(s)`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
