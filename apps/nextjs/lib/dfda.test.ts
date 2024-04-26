import { getDFDAData, createDFDAEntry } from './dfda';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@/lib/prisma');

describe('DFDA Library Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDFDAData', () => {
    it('should return DFDA data for a valid user', async () => {
      const mockUserId = '1';
      const mockDfdaData = { id: 1, name: 'Test DFDA' };
      
      (prisma.dFDA.findUnique as jest.Mock).mockResolvedValueOnce(mockDfdaData);

      const result = await getDFDAData(mockUserId);

      expect(prisma.dFDA.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toEqual(mockDfdaData);
    });

    it('should return null for an invalid user', async () => {
      const mockUserId = '1';
      
      (prisma.dFDA.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await getDFDAData(mockUserId);

      expect(prisma.dFDA.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toBeNull();
    });
  });

  describe('createDFDAEntry', () => {
    it('should create a new DFDA entry for a valid request', async () => {
      const mockUserId = '1';
      const mockDfdaData = { name: 'New DFDA Entry' };
      const mockCreatedEntry = { id: 2, ...mockDfdaData };

      (prisma.dFDA.create as jest.Mock).mockResolvedValueOnce(mockCreatedEntry);

      const result = await createDFDAEntry(mockUserId, mockDfdaData);

      expect(prisma.dFDA.create).toHaveBeenCalledWith({
        data: {
          ...mockDfdaData,
          userId: mockUserId,
        },
      });
      expect(result).toEqual(mockCreatedEntry);
    });

    it('should throw an error for an invalid request', async () => {
      const mockUserId = '1';
      const mockDfdaData = { name: 'New DFDA Entry' };
      const mockError = new Error('Database error');

      (prisma.dFDA.create as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(createDFDAEntry(mockUserId, mockDfdaData)).rejects.toThrow(mockError);
    });
  });
});