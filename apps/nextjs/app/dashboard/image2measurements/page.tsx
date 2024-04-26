"use client"
import { ChangeEvent, useState, FormEvent } from "react"
import NutritionFactsLabel from '@/components/NutritionFactsLabel'; // Adjust the import path as necessary

function getStringBetween(prefix: string, suffix: string, str: string): string {
  const start = str.indexOf(prefix);
  if (start === -1) return str; // prefix not found

  const end = str.indexOf(suffix, start + prefix.length);
  if (end === -1) return str; // suffix not found

  return str.substring(start + prefix.length, end);
}
export default function Home() {
  const [image, setImage] = useState<string>("");
  const [openAIResponse, setOpenAIResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [completeResponse, setCompleteResponse] = useState<string>("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if(event.target.files === null) {
      window.alert("No file selected. Choose a file.")
      return;
    }
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      if(typeof reader.result === "string") {
        console.log(reader.result);
        setImage(reader.result);
      }
    }

    reader.onerror = (error) => {
      console.log("error: " + error);
    }

  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if(image === "") {
      alert("Upload an image.")
      return;
    }

    setIsLoading(true); // Start loading
    setOpenAIResponse(""); // Reset previous responses
    setNutritionData([]); // Clear previous data

    await fetch("/api/image2measurements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: image // base64 image
      })
    })
    .then(async (response: any) => {
      // Because we are getting a streaming text response
      // we have to make some logic to handle the streaming text
      const reader = response.body?.getReader();
      setOpenAIResponse("");
      // reader allows us to read a new piece of info on each "read"
      // "Hello" + "I am" + "Cooper Codes"  reader.read();
      while (true) {
        const { done, value } = await reader?.read();
        // done is true once the response is done
        if(done) {


          const prefix =  "```json";
          const suffix = "```";
          const jsonData = getStringBetween(prefix, suffix, openAIResponse);
          //const parsedData = JSON.parse(jsonData); // Assuming the response is JSON formatted
          debugger
          //setNutritionData(parsedData); // Set the parsed data for rendering
          break;
        }

        // value : uint8array -> a string.
        const currentChunk = new TextDecoder().decode(value);
        setOpenAIResponse((prev) => prev + currentChunk);
      }


    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data.');
    })
    .finally(() => {
      setIsLoading(false); // End loading
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-md">
      <div className='bg-slate-800 w-full max-w-2xl rounded-lg shadow-md p-8'>
        <h2 className='text-xl font-bold mb-4'>Uploaded Image</h2>
        { image !== "" ?
          <div className="mb-4 overflow-hidden">
            <img
              src={image}
              className="w-full object-contain max-h-72"
            />
          </div>
        :
        <div className="mb-4 p-8 text-center">
          <p>Once you upload an image, you will see it here.</p>
        </div>
        }


        <form onSubmit={(e) => handleSubmit(e)}>
          <div className='flex flex-col mb-6'>
            <label className='mb-2 text-sm font-medium'>Upload Image</label>
            <input
              type="file"
              className="text-sm border rounded-lg cursor-pointer"
              onChange={(e) => handleFileChange(e)}
            />
          </div>

          <div className='flex justify-center'>
            <button type="submit" className='p-2 bg-sky-600 rounded-md mb-4'>
              Ask ChatGPT To Analyze Your Image
            </button>
          </div>

        </form>

        {nutritionData.length ? (
          <div>Loading...</div>
        ) : (
          nutritionData.map((item, index) => (
            <NutritionFactsLabel key={index} data={item} />
          ))
        )}

        {openAIResponse !== "" ?
        <div className="border-t border-gray-300 pt-4">
          <h2 className="text-xl font-bold mb-2">AI Response</h2>
          <p>{openAIResponse}</p>
        </div>
        :
        null
        }


      </div>
    </div>
  )
}

// Unit tests for image upload and processing flow
describe('Home component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handleFileChange should update state correctly with a valid file', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockEvent = { target: { files: [mockFile] } };

    await act(async () => {
      await handleFileChange(mockEvent);
    });

    expect(setImage).toHaveBeenCalledWith(expect.stringContaining('data:image/png;base64,'));
  });

  it('handleSubmit should send a POST request with the correct data', async () => {
    const mockImage = 'mockBase64Image';
    const mockResponse = { success: true, analysis: 'Mock analysis result' };
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    setImage(mockImage);

    await act(async () => {
      await handleSubmit(new Event('submit'));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/image2measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: mockImage }),
    });

    expect(setIsLoading).toHaveBeenCalledWith(true);
    expect(setOpenAIResponse).toHaveBeenCalledWith('');
    expect(setNutritionData).toHaveBeenCalledWith([]);
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });

  it('handleSubmit should handle API errors correctly', async () => {
    const mockImage = 'mockBase64Image';
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    setImage(mockImage);

    await act(async () => {
      await handleSubmit(new Event('submit'));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/image2measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: mockImage }),
    });

    expect(setIsLoading).toHaveBeenCalledWith(true);
    expect(setOpenAIResponse).toHaveBeenCalledWith('');
    expect(setNutritionData).toHaveBeenCalledWith([]);
    expect(setIsLoading).toHaveBeenCalledWith(false);
    expect(console.error).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
    expect(window.alert).toHaveBeenCalledWith('Failed to fetch data.');
  });
});
