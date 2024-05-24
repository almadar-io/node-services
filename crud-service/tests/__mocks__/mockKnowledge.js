const mockKnowledge = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(0),
    paginate: jest
      .fn()
      .mockResolvedValue({ docs: [], total: 0, limit: 10, page: 1, pages: 1 }),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    deleteOne: jest.fn().mockReturnThis().mockResolvedValue({ deletedCount: 1 }),
  };
  
  export default mockKnowledge;
  