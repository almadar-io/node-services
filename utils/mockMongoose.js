import { mock } from 'jest-mock-extended';
import mongoose from 'mongoose';
import {jest} from '@jest/globals';

// Create a mock model
const mockModel = mock();

// Define mock methods for the model
mockModel.find.mockReturnValue({
  sort: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    }),
  }),
});

mockModel.paginate.mockResolvedValue({ docs: [], totalDocs: 0 });

mockModel.findOneAndUpdate.mockResolvedValue({});

mockModel.deleteOne.mockResolvedValue({});

mockModel.joiValidate = jest.fn().mockReturnValue({ error: null });

// Export the mock model
export { mockModel };
