import { dfdaGET, dfdaPOST } from './route';
import { createMocks } from 'node-mocks-http';
import { mockDeep } from 'jest-mock-extended';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');

describe('DFDA API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dfdaGET', () => {
    it('should return DFDA data for a valid user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { dfdaPath: 'validUser' },
      });
      
      const mockDfdaData = { id: 1, name: 'Test DFDA' };
      (prisma.dFDA.findUnique as jest.Mock).mockResolvedValueOnce(mockDfdaData);

      await dfdaGET(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockDfdaData);
    });

    it('should return 404 for an invalid user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { dfdaPath: 'invalidUser' },
      });
      
      (prisma.dFDA.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await dfdaGET(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('dfdaPOST', () => {
    it('should create a new DFDA entry for a valid request', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { dfdaPath: 'newEntry' },
        body: { name: 'New DFDA Entry' },
      });
      req.session = { user: { id: 1 } } as any;

      const mockCreatedEntry = { id: 2, name: 'New DFDA Entry' };
      (prisma.dFDA.create as jest.Mock).mockResolvedValueOnce(mockCreatedEntry);

      await dfdaPOST(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockCreatedEntry);
    });

    it('should return 401 for an unauthenticated request', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { dfdaPath: 'newEntry' },
        body: { name: 'New DFDA Entry' },
      });
      req.session = {} as any;

      await dfdaPOST(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });
});