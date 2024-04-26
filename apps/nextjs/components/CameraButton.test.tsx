import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { CameraButton } from './CameraButton';

describe('CameraButton component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onCapture with the captured blob when a photo is taken', async () => {
    const mockOnCapture = jest.fn();
    const mockBlob = new Blob(['test'], { type: 'image/png' });

    global.URL.createObjectURL = jest.fn();
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }],
    });

    const { getByLabelText } = render(<CameraButton onCapture={mockOnCapture} />);
    const cameraButton = getByLabelText('Take a photo');

    await act(async () => {
      fireEvent.click(cameraButton);
    });

    const videoElement = document.querySelector('video');
    const mockCaptureStream = {
      getVideoTracks: () => [{ stop: jest.fn() }],
    };
    videoElement.srcObject = mockCaptureStream;

    const canvasElement = document.createElement('canvas');
    canvasElement.toBlob = jest.fn().mockImplementationOnce((callback) => {
      callback(mockBlob);
    });

    await act(async () => {
      fireEvent.click(cameraButton);
    });

    expect(mockOnCapture).toHaveBeenCalledWith(mockBlob);
  });

  it('should handle errors when accessing the camera stream', async () => {
    const mockOnCapture = jest.fn();
    const mockError = new Error('Camera access denied');

    global.navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValueOnce(mockError);

    const { getByLabelText } = render(<CameraButton onCapture={mockOnCapture} />);
    const cameraButton = getByLabelText('Take a photo');

    await act(async () => {
      fireEvent.click(cameraButton);
    });

    expect(mockOnCapture).not.toHaveBeenCalled();
    // You can add more assertions to check error handling behavior
  });
});