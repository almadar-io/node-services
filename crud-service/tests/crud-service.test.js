import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import crudService from '../crud-service';  // Adjust the path accordingly
import Model from '@markab.io/orbital-api/MongoDb/models/knowledges';  // Adjust the path accordingly

const app = express();
app.use(express.json());

const mockCrudDomainLogic = {
  create: jest.fn(),
  read: jest.fn(),
  update: jest.fn(),
  del: jest.fn(),
  search: jest.fn(),
};

const apiRoutes = crudService({
  Model,
  crudDomainLogic: mockCrudDomainLogic,
});

app.use('/api', apiRoutes);

beforeAll(async () => {
  // Connect to the database
  await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Disconnect from the database
  await mongoose.disconnect();
});

describe('CRUD Service', () => {
  describe('GET /', () => {
    it('should return 409 if not permitted', async () => {
      mockCrudDomainLogic.read.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).get('/api');
      expect(res.status).toBe(409);
    });

    it('should return data if permitted', async () => {
      const data = [{ name: 'test' }];
      mockCrudDomainLogic.read.mockReturnValueOnce({ isPermitted: true, criteria: {} });
      Model.find = jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(data) }) }) });
      const res = await request(app).get('/api');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(data);
    });
  });

  describe('GET /paginate/:page/:limit', () => {
    it('should return 409 if not permitted', async () => {
      mockCrudDomainLogic.read.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).get('/api/paginate/1/10');
      expect(res.status).toBe(409);
    });

    it('should return paginated data if permitted', async () => {
      const data = { docs: [{ name: 'test' }], totalDocs: 1 };
      mockCrudDomainLogic.read.mockReturnValueOnce({ isPermitted: true, criteria: {} });
      Model.paginate = jest.fn().mockResolvedValue(data);
      const res = await request(app).get('/api/paginate/1/10');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(data.docs);
    });
  });

  describe('POST /create', () => {
    it('should return 409 if not permitted', async () => {
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).post('/api/create').send({ model: {} });
      expect(res.status).toBe(409);
    });

    it('should return 409 on validation error', async () => {
      Model.joiValidate = jest.fn().mockReturnValue({ error: 'Validation error' });
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: true });
      const res = await request(app).post('/api/create').send({ model: {} });
      expect(res.status).toBe(409);
    });

    it('should return new model if permitted and valid', async () => {
      const newModel = { name: 'test' };
      Model.joiValidate = jest.fn().mockReturnValue({ error: null });
      Model.prototype.save = jest.fn().mockResolvedValue(newModel);
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: true });
      const res = await request(app).post('/api/create').send({ model: newModel });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(newModel);
    });
  });

  describe('PUT /', () => {
    it('should return 409 if not permitted', async () => {
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).put('/api').send({ model: {} });
      expect(res.status).toBe(409);
    });

    it('should return 409 on validation error', async () => {
      Model.joiValidate = jest.fn().mockReturnValue({ error: 'Validation error' });
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: true });
      const res = await request(app).put('/api').send({ model: {} });
      expect(res.status).toBe(409);
    });

    it('should return updated model if permitted and valid', async () => {
      const updatedModel = { name: 'test' };
      Model.joiValidate = jest.fn().mockReturnValue({ error: null });
      Model.findOneAndUpdate = jest.fn().mockResolvedValue(updatedModel);
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: true });
      const res = await request(app).put('/api').send({ model: updatedModel });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedModel);
    });
  });

  describe('DELETE /:_id', () => {
    it('should return 409 if not permitted', async () => {
      mockCrudDomainLogic.del.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).delete('/api/123');
      expect(res.status).toBe(409);
    });

    it('should return 200 if permitted', async () => {
      mockCrudDomainLogic.del.mockReturnValueOnce({ isPermitted: true });
      Model.deleteOne = jest.fn().mockResolvedValue({});
      const res = await request(app).delete('/api/123');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /search', () => {
    it('should return 409 if not permitted', async () => {
      mockCrudDomainLogic.search.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).post('/api/search').send({ query: {} });
      expect(res.status).toBe(409);
    });

    it('should return search results if permitted', async () => {
      const results = [{ name: 'test' }];
      mockCrudDomainLogic.search.mockReturnValueOnce({ isPermitted: true, criteria: {} });
      Model.find = jest.fn().mockResolvedValue(results);
      const res = await request(app).post('/api/search').send({ query: {} });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(results);
    });
  });
});
