import { Router } from 'express';
import {
  createVehicle,
  getAllVehicles,
  searchVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from '../controllers/vehicle.controller';
import { authenticate, requireAdmin, validate } from '../middleware/auth.middleware';
import { vehicleSchema, vehicleUpdateSchema, quantitySchema } from '../utils/validators';

const router = Router();

/**
 * All vehicle routes require JWT authentication.
 */

/**
 * @route   GET /api/vehicles/search
 * @desc    Search vehicles by make, model, category, price range
 * @access  Private
 */
router.get('/search', authenticate, searchVehicles);

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles (paginated)
 * @access  Private
 */
router.get('/', authenticate, getAllVehicles);

/**
 * @route   POST /api/vehicles
 * @desc    Add a new vehicle to inventory
 * @access  Private
 */
router.post('/', authenticate, requireAdmin, validate(vehicleSchema), createVehicle);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get a single vehicle by ID
 * @access  Private
 */
router.get('/:id', authenticate, getVehicleById);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Update vehicle details
 * @access  Private
 */
router.put('/:id', authenticate, requireAdmin, validate(vehicleUpdateSchema), updateVehicle);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete a vehicle (Admin only)
 * @access  Private + Admin
 */
router.delete('/:id', authenticate, requireAdmin, deleteVehicle);

/**
 * @route   POST /api/vehicles/:id/purchase
 * @desc    Purchase a vehicle (decrease quantity)
 * @access  Private
 */
router.post('/:id/purchase', authenticate, validate(quantitySchema), purchaseVehicle);

/**
 * @route   POST /api/vehicles/:id/restock
 * @desc    Restock a vehicle (increase quantity) (Admin only)
 * @access  Private + Admin
 */
router.post('/:id/restock', authenticate, requireAdmin, validate(quantitySchema), restockVehicle);

export default router;
