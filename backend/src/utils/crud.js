const { v4: uuidv4 } = require('uuid');

/**
 * Generic CRUD utilities for lowdb collections
 */

/**
 * Get all records from a collection
 * @param {Object} db - lowdb instance
 * @param {string} collection - collection name
 * @param {Object} filters - optional filter object
 */
const getAll = (db, collection, filters = {}) => {
  let records = db.get(collection).value();
  
  if (Object.keys(filters).length > 0) {
    records = records.filter((record) => {
      return Object.entries(filters).every(([key, value]) => {
        if (typeof value === 'string') {
          return record[key]?.toLowerCase().includes(value.toLowerCase());
        }
        return record[key] === value;
      });
    });
  }
  
  return records;
};

/**
 * Get a single record by ID
 * @param {Object} db - lowdb instance
 * @param {string} collection - collection name
 * @param {string} id - record ID
 */
const getById = (db, collection, id) => {
  return db.get(collection).find({ id }).value();
};

/**
 * Get a single record by custom field
 * @param {Object} db - lowdb instance
 * @param {string} collection - collection name
 * @param {Object} query - key-value pair to search by
 */
const getOneBy = (db, collection, query) => {
  return db.get(collection).find(query).value();
};

/**
 * Create a new record
 * @param {Object} db - lowdb instance
 * @param {string} collection - collection name
 * @param {Object} data - record data
 */
const create = (db, collection, data) => {
  const record = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  };
  
  db.get(collection).push(record).write();
  return record;
};

/**
 * Update a record by ID
 * @param {Object} db - lowdb instance
 * @param {string} collection - collection name
 * @param {string} id - record ID
 * @param {Object} data - updated data
 */
const update = (db, collection, id, data) => {
  const record = getById(db, collection, id);
  if (!record) return null;
  
  const updated = {
    ...record,
    ...data,
    id, // preserve ID
    createdAt: record.createdAt, // preserve creation date
    updatedAt: new Date().toISOString(),
  };
  
  db.get(collection).find({ id }).assign(updated).write();
  return updated;
};

/**
 * Delete a record by ID
 * @param {Object} db - lowdb instance
 * @param {string} collection - collection name
 * @param {string} id - record ID
 */
const remove = (db, collection, id) => {
  const record = getById(db, collection, id);
  if (!record) return null;
  
  db.get(collection).remove({ id }).write();
  return record;
};

/**
 * Count records in a collection
 * @param {Object} db - lowdb instance
 * @param {string} collection - collection name
 * @param {Object} filters - optional filter object
 */
const count = (db, collection, filters = {}) => {
  return getAll(db, collection, filters).length;
};

/**
 * Paginate records
 * @param {Object} db - lowdb instance
 * @param {string} collection - collection name
 * @param {number} page - page number (1-indexed)
 * @param {number} limit - records per page
 * @param {Object} filters - optional filters
 */
const paginate = (db, collection, page = 1, limit = 10, filters = {}) => {
  const all = getAll(db, collection, filters);
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const records = all.slice(offset, offset + limit);
  
  return {
    data: records,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Search records by a text query across multiple fields
 */
const search = (db, collection, query, fields = []) => {
  if (!query) return db.get(collection).value();
  
  const lowerQuery = query.toLowerCase();
  return db.get(collection).filter((record) => {
    return fields.some((field) => {
      const value = record[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
  }).value();
};

module.exports = {
  getAll,
  getById,
  getOneBy,
  create,
  update,
  remove,
  count,
  paginate,
  search,
};
