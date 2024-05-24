import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import crudService from "../crud-service.js"; // Adjust the path accordingly
import { mockModel } from "../../utils/mockMongoose.js"; // Adjust the path accordingly
import Knowledge from "@markab.io/orbital-api/MongoDb/models/knowledges.js"; // Your Mongoose model
import { jest } from "@jest/globals";

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
  Model: mockModel,
  crudDomainLogic: mockCrudDomainLogic,
});

app.use("/api", apiRoutes);

describe("CRUD Service", () => {
  beforeAll(async () => {
    // Setup test data if necessary
    Knowledge.create.mockResolvedValue({
      /* your test data */
    });
  });

  afterAll(async () => {
    // Clean up test data if necessary
    jest.clearAllMocks();
  });
  describe("GET /", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.read.mockReturnValueOnce({ isPermitted: false });
      const mockData = [
        {
          /* your mocked data */
        },
      ];
      Knowledge.find.mockResolvedValue(mockData);
      const res = await request(app).get("/api");
      expect(res.status).toBe(409);
      // Verify the methods were called correctly
      expect(Knowledge.find).toHaveBeenCalled();
      expect(Knowledge.sort).toHaveBeenCalledWith("-createdAt");
      expect(Knowledge.populate).toHaveBeenCalled();
      expect(Knowledge.select).toHaveBeenCalled();
      expect(Knowledge.exec).toHaveBeenCalled();
    });

    it("should return data if permitted", async () => {
      const data = [{ name: "test" }];
      mockCrudDomainLogic.read.mockReturnValueOnce({
        isPermitted: true,
        criteria: {},
      });
      mockModel.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue(data),
          }),
        }),
      });
      const res = await request(app).get("/api");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(data);
    });
  });

  describe("GET /paginate/:page/:limit", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.read.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).get("/api/paginate/1/10");
      expect(res.status).toBe(409);
    });

    it("should return paginated data if permitted", async () => {
      const data = { docs: [{ name: "test" }], totalDocs: 1 };
      mockCrudDomainLogic.read.mockReturnValueOnce({
        isPermitted: true,
        criteria: {},
      });
      mockModel.paginate.mockResolvedValueOnce(data);
      const res = await request(app).get("/api/paginate/1/10");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(data.docs);
    });
  });

  describe("POST /create", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).post("/api/create").send({ model: {} });
      expect(res.status).toBe(409);
    });

    it("should return 409 on validation error", async () => {
      mockModel.joiValidate.mockReturnValueOnce({ error: "Validation error" });
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: true });
      const res = await request(app).post("/api/create").send({ model: {} });
      expect(res.status).toBe(409);
    });

    it("should return new model if permitted and valid", async () => {
      const newModel = { name: "test" };
      mockModel.joiValidate.mockReturnValueOnce({ error: null });
      mockModel.prototype.save = jest.fn().mockResolvedValue(newModel);
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: true });
      const res = await request(app)
        .post("/api/create")
        .send({ model: newModel });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(newModel);
    });
  });

  describe("PUT /", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).put("/api").send({ model: {} });
      expect(res.status).toBe(409);
    });

    it("should return 409 on validation error", async () => {
      mockModel.joiValidate.mockReturnValueOnce({ error: "Validation error" });
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: true });
      const res = await request(app).put("/api").send({ model: {} });
      expect(res.status).toBe(409);
    });

    it("should return updated model if permitted and valid", async () => {
      const updatedModel = { name: "test" };
      mockModel.joiValidate.mockReturnValueOnce({ error: null });
      mockModel.findOneAndUpdate.mockResolvedValueOnce(updatedModel);
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: true });
      const res = await request(app).put("/api").send({ model: updatedModel });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedModel);
    });
  });

  describe("DELETE /:_id", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.del.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).delete("/api/123");
      expect(res.status).toBe(409);
    });

    it("should return 200 if permitted", async () => {
      mockCrudDomainLogic.del.mockReturnValueOnce({ isPermitted: true });
      mockModel.deleteOne.mockResolvedValueOnce({});
      const res = await request(app).delete("/api/123");
      expect(res.status).toBe(200);
    });
  });

  describe("POST /search", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.search.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).post("/api/search").send({ query: {} });
      expect(res.status).toBe(409);
    });

    it("should return search results if permitted", async () => {
      const results = [{ name: "test" }];
      mockCrudDomainLogic.search.mockReturnValueOnce({
        isPermitted: true,
        criteria: {},
      });
      mockModel.find.mockResolvedValueOnce(results);
      const res = await request(app).post("/api/search").send({ query: {} });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(results);
    });
  });
});
