"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle
} from '@/components/ui/credenza';
import { MeasurementsAddForm } from "@/components/userVariable/measurements/measurements-add-form";
import { UserVariable } from "@/types/models/UserVariable";
import { Icons } from "@/components/icons";
import { ButtonProps } from 'react-day-picker';

interface MeasurementButtonProps extends ButtonProps {
  userVariable: Pick<
    UserVariable,
    "id" | "name" | "description" | "createdAt" | "imageUrl" |
    "combinationOperation" | "unitAbbreviatedName" | "variableCategoryName" |
    "lastValue" | "unitName" | "userId" | "variableId"
  >
  className: string;
  size: string;
  variant: string;
}

export function MeasurementButton({ userVariable, ...props }: MeasurementButtonProps) {

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showMeasurementAlert, setShowMeasurementAlert] = React.useState<boolean>(false)

  async function onClick() {
    setShowMeasurementAlert(true)
    //router.refresh();
  }

  // Destructure `ref` and `size` out of props to avoid passing it to the Button component if not valid
  const { ref, size, ...buttonProps } = props;


  return (
    <>
      <Button onClick={onClick} {...buttonProps} size={"default"} variant={"default"}>
        <Icons.add className="h-4 w-4" />
      </Button>
      {isFormOpen && (
        <Credenza>
          <MeasurementsAddForm
            userVariable={userVariable}
            setShowMeasurementAlert={setShowMeasurementAlert}
          />
        </Credenza>
      )}
      <Credenza open={showMeasurementAlert} onOpenChange={setShowMeasurementAlert}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Record a Measurement</CredenzaTitle>
            <CredenzaDescription>
              This will record a {userVariable.name} measurement.
            </CredenzaDescription>
          </CredenzaHeader>
          <MeasurementsAddForm
            userVariable={userVariable}
            setShowMeasurementAlert={setShowMeasurementAlert}
          />
        </CredenzaContent>
      </Credenza>
    </>
  );
}

// Unit tests for MeasurementButton component
describe('MeasurementButton component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open the measurement form when the button is clicked', async () => {
    const mockUserVariable = {
      id: '1',
      name: 'Test Variable',
      description: 'Test description',
      // ... other properties
    };

    const { getByRole } = render(<MeasurementButton userVariable={mockUserVariable} />);
    const button = getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(setShowMeasurementAlert).toHaveBeenCalledWith(true);
  });

  it('should submit the measurement form successfully', async () => {
    const mockUserVariable = {
      id: '1',
      name: 'Test Variable',
      description: 'Test description',
      // ... other properties
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    const { getByRole } = render(<MeasurementButton userVariable={mockUserVariable} />);
    const button = getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    const form = getByRole('form');

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userVariableId: mockUserVariable.id,
        value: expect.any(Number),
        note: '',
      }),
    });

    expect(setShowMeasurementAlert).toHaveBeenCalledWith(false);
  });

  it('should handle form submission errors', async () => {
    const mockUserVariable = {
      id: '1',
      name: 'Test Variable',
      description: 'Test description',
      // ... other properties
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ error: 'Test error' }),
    });

    const { getByRole } = render(<MeasurementButton userVariable={mockUserVariable} />);
    const button = getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    const form = getByRole('form');

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userVariableId: mockUserVariable.id,
        value: expect.any(Number),
        note: '',
      }),
    });

    expect(toast).toHaveBeenCalledWith({
      title: 'Something went wrong.',
      description: 'Your measurement was not recorded. Please try again.',
      variant: 'destructive',
    });
  });
});
