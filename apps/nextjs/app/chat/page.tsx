"use client"

import dynamic from 'next/dynamic';
const ChatComponent = dynamic(() => import('./ChatComponent'), {
  ssr: true,
});
import React, { useState, useCallback } from 'react';
import { convertFileToBase64 } from '../utils/convertFileToBase64';
import {Shell} from "@/components/layout/shell";
import {DashboardHeader} from "@/components/pages/dashboard/dashboard-header";
import {AnalyzeButton} from "@/components/AnalyzeButton";
import {FileUploader} from "@/components/FileUploader";
import {AnalysisResult} from "@/components/AnalysisResult";
import {CameraButton} from "@/components/CameraButton"; // Importing the CameraButton component

// The main App component
const App: React.FC = () => {
  // State management for various functionalities
  const [file, setFile] = useState<File | null>(null); // Holds the selected image file
  const [preview, setPreview] = useState<string>(''); // URL for the image preview
  const [result, setResult] = useState<string>(''); // Stores the analysis result
  const [statusMessage, setStatusMessage] = useState<string>(''); // Displays status messages to the user
  const [uploadProgress, setUploadProgress] = useState<number>(0); // Manages the upload progress
  const [textInput, setTextInput] = useState<string>(''); // Custom text input by the user
  const [base64Image, setBase64Image] = useState<string>('');

  // Callback for handling file selection changes
  const handleFileChange = useCallback(async (selectedFile: File) => {
    // Updating state with the new file and its preview URL
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setStatusMessage('Image selected. Click "Analyze Image" to proceed.');
    setUploadProgress(0);

    // Convert the file to a base64 string and store it in the state
    const base64 = await convertFileToBase64(selectedFile);
    setBase64Image(base64);
  }, []);

  // Function to handle Blob from CameraButton and convert it to File
  const handleCapture = useCallback((blob: Blob | null) => {
    if (blob) {
      const file = new File([blob], "captured_image.png", { type: blob.type });
      handleFileChange(file);
    }
  }, [handleFileChange]);

  // Function to handle submission for image analysis
  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!file) {
      setStatusMessage('No file selected!');
      return;
    }

    setStatusMessage('Sending request...');
    setUploadProgress(40); // Progress after image conversion

    // Send a POST request to your API endpoint
    const response = await fetch('/api/image2measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Image,
        prompt: textInput,
      }),
    });

    setUploadProgress(60);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse = await response.json();
    setUploadProgress(80); // Progress after receiving response

    if (apiResponse.success) {
      setResult(apiResponse.analysis);
      setStatusMessage('Analysis complete.');
      setUploadProgress(100); // Final progress
    } else {
      setStatusMessage(apiResponse.message);
    }
  };

  return (
    <Shell>
      <DashboardHeader
        heading="Image 2 Measurements"
        text="Upload an Image of a Medication, Food, or Supplement"
      />
      <div className="flex">
        <div className="text-center mx-auto my-5 p-5 border border-gray-300 rounded-lg max-w-md">
          <div className="p-4">
            <CameraButton onCapture={handleCapture}/>
          </div>
          <div>
            OR
          </div>
          <FileUploader onFileChange={handleFileChange} preview={preview}/>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Optional: Include any additional info"
            className="mb-5 p-2 border border-gray-300 rounded-lg w-full"
          />
          <AnalyzeButton onClick={handleSubmit} uploadProgress={uploadProgress}/>
          {statusMessage && <p className="text-gray-600 mb-5">{statusMessage}</p>}
          {result && <AnalysisResult result={result}/>}
        </div>
        <ChatComponent base64Image={base64Image}/>
      </div>
    </Shell>
  );
}

export default App;

// Unit tests for file handling logic
describe('App component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handleFileChange should update state correctly with a valid file', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockBase64 = 'mockBase64String';
    
    jest.spyOn(URL, 'createObjectURL').mockReturnValueOnce('mockUrl');
    jest.spyOn(global, 'convertFileToBase64').mockResolvedValueOnce(mockBase64);

    await act(async () => {
      await handleFileChange(mockFile);
    });

    expect(setFile).toHaveBeenCalledWith(mockFile);
    expect(setPreview).toHaveBeenCalledWith('mockUrl');
    expect(setStatusMessage).toHaveBeenCalledWith('Image selected. Click "Analyze Image" to proceed.');
    expect(setUploadProgress).toHaveBeenCalledWith(0);
    expect(setBase64Image).toHaveBeenCalledWith(mockBase64);
  });

  it('handleCapture should call handleFileChange with the captured Blob', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/png' });
    const mockFile = new File([mockBlob], 'captured_image.png', { type: 'image/png' });

    await act(async () => {
      await handleCapture(mockBlob);
    });

    expect(handleFileChange).toHaveBeenCalledWith(mockFile);
  });
});
