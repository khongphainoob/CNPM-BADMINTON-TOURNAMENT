import {
  deleteItemById,
  fetchItemById,
  insertItem,
  listItems as listItemsRepo,
  updateItemById
} from './module.repo.js';

export async function listItems({ limit, offset } = {}) {
  return listItemsRepo({ limit, offset });
}

export async function getItem(id) {
  return fetchItemById(id);
}

export async function createItem({ name }) {
  return insertItem({ name });
}

export async function updateItem(id, { name }) {
  return updateItemById(id, { name });
}

export async function deleteItem(id) {
  return deleteItemById(id);
}
