import { Request, Response } from 'express';
import { VehicleModel } from '../models/vehicle.model';

/**
 * POST /api/vehicles
 * Creates a new vehicle in the inventory.
 */
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await VehicleModel.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Vehicle added to inventory successfully',
      data: { vehicle },
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to create vehicle' });
  }
};

/**
 * GET /api/vehicles
 * Returns a paginated list of all vehicles.
 */
export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await VehicleModel.findAll(page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve vehicles' });
  }
};

/**
 * GET /api/vehicles/search
 * Searches vehicles by make, model, category, and/or price range.
 */
export const searchVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, category, minPrice, maxPrice, page, limit } = req.query;

    const filters = {
      make: make as string | undefined,
      model: model as string | undefined,
      category: category as Vehicle['category'] | undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    };

    const result = await VehicleModel.search(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Search vehicles error:', error);
    res.status(500).json({ success: false, message: 'Failed to search vehicles' });
  }
};

/**
 * GET /api/vehicles/:id
 * Returns a single vehicle by ID.
 */
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
      return;
    }

    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    res.status(200).json({ success: true, data: { vehicle } });
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve vehicle' });
  }
};

/**
 * PUT /api/vehicles/:id
 * Updates vehicle details.
 */
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
      return;
    }

    const existing = await VehicleModel.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    const updated = await VehicleModel.update(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: { vehicle: updated },
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to update vehicle' });
  }
};

/**
 * DELETE /api/vehicles/:id
 * Deletes a vehicle. Admin only.
 */
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
      return;
    }

    const deleted = await VehicleModel.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
  }
};

/**
 * POST /api/vehicles/:id/purchase
 * Decrements vehicle quantity (purchase).
 */
export const purchaseVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
      return;
    }

    if (!quantity || quantity <= 0) {
      res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
      return;
    }

    const updated = await VehicleModel.purchase(id, quantity);
    res.status(200).json({
      success: true,
      message: `Successfully purchased ${quantity} unit(s) of ${updated.make} ${updated.model}`,
      data: { vehicle: updated },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Vehicle not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message.startsWith('Insufficient stock')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
    }
    console.error('Purchase vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to process purchase' });
  }
};

/**
 * POST /api/vehicles/:id/restock
 * Increments vehicle quantity (restock). Admin only.
 */
export const restockVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
      return;
    }

    if (!quantity || quantity <= 0) {
      res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
      return;
    }

    const updated = await VehicleModel.restock(id, quantity);
    res.status(200).json({
      success: true,
      message: `Successfully restocked ${quantity} unit(s) of ${updated.make} ${updated.model}`,
      data: { vehicle: updated },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Vehicle not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    console.error('Restock vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to process restock' });
  }
};

// Import Vehicle type for type annotation
import { Vehicle } from '../models/vehicle.model';
