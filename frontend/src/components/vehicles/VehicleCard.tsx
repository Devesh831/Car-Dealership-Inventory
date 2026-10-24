import type { Vehicle } from '../../lib/api';

const CATEGORY_COLORS: Record<string, string> = {
  Sedan: 'badge-blue',
  SUV: 'badge-green',
  Truck: 'badge-yellow',
  Coupe: 'badge-purple',
  Van: 'badge-gray',
  Electric: 'badge-green',
  Hybrid: 'badge-blue',
};

const STOCK_THRESHOLD = 3;

interface VehicleCardProps {
  vehicle: Vehicle;
  isAdmin: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onRestock: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  isAdmin,
  onPurchase,
  onRestock,
  onEdit,
  onDelete,
}: VehicleCardProps) {
  const isOutOfStock = vehicle.quantity === 0;
  const isLowStock = vehicle.quantity > 0 && vehicle.quantity <= STOCK_THRESHOLD;

  const stockBadge = isOutOfStock
    ? 'badge-red'
    : isLowStock
    ? 'badge-yellow'
    : 'badge-green';

  const stockLabel = isOutOfStock
    ? 'Out of stock'
    : isLowStock
    ? `Low stock (${vehicle.quantity})`
    : `In stock (${vehicle.quantity})`;

  return (
    <div className="card-hover flex flex-col">
      {/* Image */}
      <div className="relative bg-surface-elevated h-44 overflow-hidden">
        {vehicle.image_url ? (
          <img
            src={vehicle.image_url}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-20 h-20 text-surface-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.586-2.586A2 2 0 017 13h10a2 2 0 011.414.586L21 16V6a1 1 0 00-1-1h-2" />
            </svg>
          </div>
        )}
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={CATEGORY_COLORS[vehicle.category] || 'badge-gray'}>
            {vehicle.category}
          </span>
        </div>
        {/* Year badge */}
        <div className="absolute top-3 right-3">
          <span className="badge-gray">{vehicle.year}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-white text-lg leading-tight">
            {vehicle.make} {vehicle.model}
          </h3>
        </div>

        {vehicle.description && (
          <p className="text-gray-400 text-xs mb-3 line-clamp-2">{vehicle.description}</p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className={stockBadge}>{stockLabel}</span>
        </div>

        <div className="mt-auto">
          <p className="text-2xl font-extrabold text-white mb-4">
            ${vehicle.price.toLocaleString()}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => onPurchase(vehicle)}
              disabled={isOutOfStock}
              className="btn-primary flex-1 text-xs"
              title={isOutOfStock ? 'Out of stock' : 'Purchase'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Buy
            </button>

            {isAdmin && (
              <>
                <button onClick={() => onRestock(vehicle)} className="btn-success text-xs px-3" title="Restock">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button onClick={() => onEdit(vehicle)} className="btn-secondary text-xs px-3" title="Edit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => onDelete(vehicle)} className="btn-danger text-xs px-3" title="Delete">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
