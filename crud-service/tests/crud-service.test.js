import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import crudService from "../crud-service.js"; // Adjust the path accordingly
import { mockModel } from "../../utils/mockMongoose.js"; // Adjust the path accordingly
import Model from "@markab.io/orbital-api/MongoDb/models/knowledges.js"; // Your Mongoose model
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
    jest.spyOn(Model, "create").mockResolvedValue({
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
      jest.spyOn(Model, "find").mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });

      const res = await request(app).get("/api");
      expect(res.status).toBe(409);
      // Verify the methods were called correctly
      expect(Model.find).toHaveBeenCalled();
      expect(Model.find().sort).toHaveBeenCalledWith("-createdAt");
      expect(Model.find().populate).toHaveBeenCalled();
      expect(Model.find().select).toHaveBeenCalled();
      expect(Model.find().exec).toHaveBeenCalled();
    });

    it("should return data if permitted", async () => {
      const mockData = [{ name: "test" }];
      mockCrudDomainLogic.read.mockReturnValueOnce({
        isPermitted: true,
        criteria: {},
      });
      jest.spyOn(Model, "find").mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });

      const res = await request(app).get("/api");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockData);
      // Verify the methods were called correctly
      expect(Model.find).toHaveBeenCalled();
      expect(Model.find().sort).toHaveBeenCalledWith("-createdAt");
      expect(Model.find().populate).toHaveBeenCalled();
      expect(Model.find().select).toHaveBeenCalled();
      expect(Model.find().exec).toHaveBeenCalled();
    });
  });

  describe("GET /paginate/:page/:limit", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.read.mockReturnValueOnce({ isPermitted: false });
      const mockData = [
        {
          /* your mocked data */
        },
      ];
      jest.spyOn(Model, "find").mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });

      const res = await request(app).get("/api/paginate/1/10");
      expect(res.status).toBe(409);
      // Verify the methods were called correctly
      expect(Model.find).toHaveBeenCalled();
      expect(Model.find().sort).toHaveBeenCalledWith("-createdAt");
      expect(Model.find().populate).toHaveBeenCalled();
      expect(Model.find().select).toHaveBeenCalled();
      expect(Model.find().exec).toHaveBeenCalled();
    });

    it("should return paginated data if permitted", async () => {
      const mockData = { docs: [{ name: "test" }], totalDocs: 1 };
      mockCrudDomainLogic.read.mockReturnValueOnce({
        isPermitted: true,
        criteria: {},
      });
      jest.spyOn(Model, "paginate").mockResolvedValueOnce(mockData);

      const res = await request(app).get("/api/paginate/1/10");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockData.docs);
      // Verify the methods were called correctly
      expect(Model.paginate).toHaveBeenCalled();
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
      jest.spyOn(Model.prototype, "save").mockResolvedValueOnce(newModel);
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: true });

      const res = await request(app)
        .post("/api/create")
        .send({ model: newModel });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(newModel);
      // Verify the methods were called correctly
      expect(Model.prototype.save).toHaveBeenCalled();
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
      jest.spyOn(Model, "findOneAndUpdate").mockResolvedValueOnce(updatedModel);
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: true });

      const res = await request(app).put("/api").send({ model: updatedModel });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedModel);
      // Verify the methods were called correctly
      expect(Model.findOneAndUpdate).toHaveBeenCalled();
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
      jest.spyOn(Model, "deleteOne").mockResolvedValueOnce({});
      const res = await request(app).delete("/api/123");
      expect(res.status).toBe(200);
      // Verify the methods were called correctly
      expect(Model.deleteOne).toHaveBeenCalled();
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
      jest.spyOn(Model, "find").mockResolvedValueOnce(results);

      const res = await request(app).post("/api/search").send({ query: {} });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(results);
      // Verify the methods were called correctly
      expect(Model.find).toHaveBeenCalled();
    });
  });
});
