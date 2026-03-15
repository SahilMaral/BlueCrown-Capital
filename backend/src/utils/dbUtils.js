const mongoose = require('mongoose');

/**
 * Execute work within a MongoDB transaction if supported.
 * Falls back to normal execution for standalone MongoDB instances.
 * 
 * @param {Function} callback - Async function that takes (session) and performs DB ops
 * @returns {Promise<any>} - The result of the callback
 */
const withTransaction = async (callback) => {
  let session = null;
  let isStandalone = false;

  try {
    // Check if we are connected to a replica set
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    isStandalone = !serverStatus.repl;
  } catch (err) {
    // If we can't check, assume it might be a standalone for safety in local dev
    console.warn('Could not detect MongoDB replica set status, falling back to standalone mode.');
    isStandalone = true;
  }

  if (isStandalone) {
    // Standalone fallback: Just run the callback without a session
    return await callback(null);
  }

  // Replica Set mode: Use real transactions
  session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  withTransaction
};
