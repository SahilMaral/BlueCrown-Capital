const Counter = require('../models/Counter');
const ApiError = require('../utils/ApiError');

const getNextSequence = async (name, year) => {
  let counter = await Counter.findOne({ counterName: name, financialYear: year });
  
  if (!counter) {
    // Determine prefix based on name
    const prefix = name === 'receipt' ? 'RCP-' : 'PAY-';
    counter = await Counter.create({
      counterName: name,
      prefix,
      financialYear: year,
      countNumber: 1
    });
  }

  const sequence = `${counter.prefix}${year}-${String(counter.countNumber).padStart(4, '0')}`;
  
  // Advance counter for NEXT call (or we can do this at the end of transaction)
  // For atomic safety, we might want to increment and return the same doc in one go if possible
  // but Mongoose findOneAndUpdate is better for this.
  
  return { sequence, counterId: counter._id };
};

const incrementCounter = async (id) => {
  return await Counter.findByIdAndUpdate(id, { $inc: { countNumber: 1 } });
};

const getCounters = async (query = {}) => {
  return await Counter.find(query).sort({ counterName: 1 });
};

const updateCounter = async (id, counterData) => {
  const counter = await Counter.findByIdAndUpdate(id, counterData, {
    new: true,
    runValidators: true
  });
  if (!counter) {
    throw new ApiError(404, 'Counter not found');
  }
  return counter;
};

const deleteCounter = async (id) => {
  const counter = await Counter.findByIdAndDelete(id);
  if (!counter) {
    throw new ApiError(404, 'Counter not found');
  }
  return counter;
};

module.exports = {
  getNextSequence,
  incrementCounter,
  getCounters,
  updateCounter,
  deleteCounter
};
