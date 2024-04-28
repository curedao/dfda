import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { handleError } from '@/lib/errorHandler';
import { dfdaGET, dfdaPOST } from '@/lib/dfda';
import { GET, POST } from 'apps/nextjs/app/api/dfda/[dfdaPath]/route';

jest.mock('next-auth/next');
jest.mock('@/lib/dfda');

describe('GET /api/dfda/[dfdaPath]', () => {
  it('should return 200 with data on successful request', async () => {
    // Mock dependencies
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: 'user-id' } });
    (dfdaGET as jest.Mock).mockResolvedValueOnce({ data: { key: 'value' } });
    
    // Call GET and check response
    const response = await GET(new Request('https://example.com/api/dfda/test'), { params: { dfdaPath: 'test' } });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual({ key: 'value' });
  });

  it('should return error response on failed request', async () => {
    // Mock error
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: 'user-id' } });
    (dfdaGET as jest.Mock).mockRejectedValueOnce(new Error('Request failed'));

    // Call GET and check error response
    const response = await GET(new Request('https://example.com/api/dfda/test'), { params: { dfdaPath: 'test' } });
    expect(response.status).toBe(500);
  });
});

describe('POST /api/dfda/[dfdaPath]', () => {
  it('should return 200 with data on successful request', async () => {
    // Mock dependencies 
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: 'user-id' } });
    (dfdaPOST as jest.Mock).mockResolvedValueOnce({ data: { key: 'value' }, status: 200 });

    // Call POST and check response  
    const response = await POST(new Request('https://example.com/api/dfda/test'), { params: { dfdaPath: 'test' } });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual({ key: 'value' });
  });

  it('should return error response on failed request', async () => {
    // Mock error
    (getServerSession as jest.Mock).mockResolvedValueOnce({ user: { id: 'user-id' } });
    (dfdaPOST as jest.Mock).mockRejectedValueOnce(new Error('Request failed'));

    // Call POST and check error response
    const response = await POST(new Request('https://example.com/api/dfda/test'), { params: { dfdaPath: 'test' } });  
    expect(response.status).toBe(500);
  });
});