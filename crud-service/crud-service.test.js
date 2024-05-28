import request from "supertest";
import express from "express";
import crudService from "./crud-service.js"; // Adjust the path accordingly
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

const mockExec = jest.fn();
const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
const mockPopulate = jest.fn().mockReturnValue({ select: mockSelect });
const mockSort = jest.fn().mockReturnValue({ populate: mockPopulate });
const mockFind = jest.fn().mockReturnValue({ sort: mockSort });
const mockFindOneAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
const mockDeleteOne = jest.fn().mockReturnValue({ exec: mockExec });

class MockModel {
  constructor(data) {
    Object.assign(this, data);
  }

  save = jest.fn().mockResolvedValue(this);
  static find = mockFind;
  static paginate = jest.fn();
  static countDocuments = jest.fn().mockReturnValue({ exec: mockExec });
  static joiValidate = jest.fn();
  static findOneAndUpdate = mockFindOneAndUpdate;
  static deleteOne = mockDeleteOne;
}

const apiRoutes = crudService({
  Model: MockModel,
  crudDomainLogic: mockCrudDomainLogic,
});

app.use("/api", apiRoutes);

describe("CRUD Service", () => {
  describe("GET /", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.read.mockReturnValueOnce({
        isPermitted: false,
        criteria: {},
      });
      const res = await request(app).get("/api");
      expect(res.status).toBe(409);
    });

    it("should return data if permitted", async () => {
      const data = [{ name: "test" }];
      mockCrudDomainLogic.read.mockReturnValueOnce({
        isPermitted: true,
        criteria: {},
      });
      mockExec.mockResolvedValueOnce(data);

      const res = await request(app).get("/api");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(data);
    });
  });

  describe("GET /paginate/:page/:limit", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.read.mockReturnValueOnce({
        isPermitted: false,
        criteria: {},
      });
      const res = await request(app).get("/api/paginate/1/10");
      expect(res.status).toBe(409);
    });

    it("should return paginated data if permitted", async () => {
      const data = { docs: [{ name: "test" }], totalDocs: 1 };
      mockCrudDomainLogic.read.mockReturnValueOnce({
        isPermitted: true,
        criteria: {},
      });
      mockExec.mockResolvedValueOnce(1); // Mock countDocuments exec return value
      MockModel.paginate.mockResolvedValueOnce(data);

      const res = await request(app).get("/api/paginate/1/10");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(data.docs);
    });
  });

  describe("POST /create", () => {
    it("should return 409 on validation error", async () => {
      MockModel.joiValidate.mockReturnValueOnce({ error: "Validation error" });
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: true });

      const res = await request(app).post("/api/create").send({ model: {} });
      expect(res.status).toBe(409);
      expect(res.body.message).toBe(
        "Error validating your input: Validation error"
      );
    });

    it("should return new model if permitted and valid", async () => {
      const newModel = { name: "test" };
      MockModel.joiValidate.mockReturnValueOnce({ error: null });
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: true });

      const res = await request(app)
        .post("/api/create")
        .send({ model: newModel });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(newModel);
    });

    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.create.mockReturnValueOnce({ isPermitted: false });

      const res = await request(app).post("/api/create").send({ model: {} });
      expect(res.status).toBe(409);
    });
  });

  describe("PUT /", () => {
    it("should return 409 if not permitted", async () => {
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: false });
      const res = await request(app).put("/api").send({ model: {} });
      expect(res.status).toBe(409);
    });

    it("should return 409 on validation error", async () => {
      MockModel.joiValidate.mockReturnValueOnce({ error: "Validation error" });
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: true });
      const res = await request(app).put("/api").send({ model: {} });
      expect(res.status).toBe(409);
    });

    it("should return updated model if permitted and valid", async () => {
      const updatedModel = { name: "test" };
      MockModel.joiValidate.mockReturnValueOnce({ error: null });
      mockCrudDomainLogic.update.mockReturnValueOnce({ isPermitted: true });
      mockFindOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(updatedModel),
      });

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
      mockDeleteOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({}),
      });

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
      mockFind.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(results),
      });

      const res = await request(app).post("/api/search").send({ query: {} });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(results);
    });
  });
});
