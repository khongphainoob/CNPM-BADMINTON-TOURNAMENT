import {
  createItem as createItemService,
  deleteItem as deleteItemService,
  getItem as getItemService,
  listItems as listItemsService,
  updateItem as updateItemService
} from './module.service.js';
import { parsePagination } from '../../utils/pagination.js';
import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1)
});

export const updateItemSchema = z.object({
  name: z.string().min(1)
});

export function getHealth(req, res) {
  res.json({ module: 'module', status: 'ok' });
}

export async function listItems(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { items, total } = await listItemsService({ limit, offset });
    res.json({ data: items, meta: { page, limit, total } });
  } catch (error) {
    next(error);
  }
}

export async function getItem(req, res, next) {
  try {
    const item = await getItemService(req.params.id);

    if (!item) {
      return res.status(404).json({ error: { message: 'Item not found', status: 404 } });
    }

    return res.json({ data: item });
  } catch (error) {
    return next(error);
  }
}

export async function createItem(req, res, next) {
  try {
    const { name } = req.body;

    const item = await createItemService({ name });
    return res.status(201).json({ data: item });
  } catch (error) {
    return next(error);
  }
}

export async function updateItem(req, res, next) {
  try {
    const { name } = req.body;

    const item = await updateItemService(req.params.id, { name });

    if (!item) {
      return res.status(404).json({ error: { message: 'Item not found', status: 404 } });
    }

    return res.json({ data: item });
  } catch (error) {
    return next(error);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const deleted = await deleteItemService(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: { message: 'Item not found', status: 404 } });
    }

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
