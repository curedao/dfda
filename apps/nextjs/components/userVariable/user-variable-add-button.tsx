"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button, ButtonProps } from "@/components/ui/button"
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

interface UserVariableAddButtonProps extends ButtonProps {}

export function UserVariableAddButton({ ...props }: UserVariableAddButtonProps) {
  const router = useRouter()
  const [showAddAlert, setShowAddAlert] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onClick() {
    setIsLoading(true)

    const response = await fetch("/api/userVariables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "New Variable",
      }),
    })

    if (!response?.ok) {
      setIsLoading(false)
      setShowAddAlert(false)

      return toast({
        title: "Something went wrong.",
        description: "Your userVariable was not created. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "A new variable has been created successfully.",
    })

    const userVariable = await response.json()

    setIsLoading(false)
    setShowAddAlert(false)

    router.push(`/dashboard/userVariables/${userVariable.id}/settings`)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setShowAddAlert(true)} {...props}>
        <Icons.add className="mr-2 h-4 w-4" />
        New variable
      </Button>

      {/* Add Alert */}
      <Credenza open={showAddAlert} onOpenChange={setShowAddAlert}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>
              Are you sure you want to create a new variable?
            </CredenzaTitle>
            <CredenzaDescription>
              This will add a new variable to your account.
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaFooter className="flex flex-col-reverse">
            <CredenzaClose asChild>
              <Button variant="outline">Cancel</Button>
            </CredenzaClose>
            <Button onClick={onClick} disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.add className="mr-2 h-4 w-4" />
              )}
              <span>Add userVariable</span>
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </>
  )
}

// Unit tests for UserVariableAddButton component
describe('UserVariableAddButton component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open the add alert when the button is clicked', async () => {
    const { getByRole } = render(<UserVariableAddButton />);
    const button = getByRole('button', { name: 'New variable' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(setShowAddAlert).toHaveBeenCalledWith(true);
  });

  it('should create a new user variable successfully', async () => {
    const mockUserVariable = { id: '1', name: 'New Variable' };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockUserVariable),
    });

    const { getByRole } = render(<UserVariableAddButton />);
    const button = getByRole('button', { name: 'New variable' });

    await act(async () => {
      fireEvent.click(button);
    });

    const addButton = getByRole('button', { name: 'Add userVariable' });

    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/userVariables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'New Variable' }),
    });

    expect(toast).toHaveBeenCalledWith({
      description: 'A new variable has been created successfully.',
    });

    expect(router.push).toHaveBeenCalledWith(`/dashboard/userVariables/${mockUserVariable.id}/settings`);
    expect(router.refresh).toHaveBeenCalled();
  });

  it('should handle errors when creating a new user variable', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
    });

    const { getByRole } = render(<UserVariableAddButton />);
    const button = getByRole('button', { name: 'New variable' });

    await act(async () => {
      fireEvent.click(button);
    });

    const addButton = getByRole('button', { name: 'Add userVariable' });

    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/userVariables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'New Variable' }),
    });

    expect(toast).toHaveBeenCalledWith({
      title: 'Something went wrong.',
      description: 'Your userVariable was not created. Please try again.',
      variant: 'destructive',
    });
  });
});
