"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import {UserVariable} from "@/types/models/UserVariable";
import {userVariablePatchSchema} from "@/lib/validations/userVariable";

interface UserVariableEditFormProps extends React.HTMLAttributes<HTMLFormElement> {
  userVariable: Pick<UserVariable, "id" | "name" | "description">
}

type FormData = z.infer<typeof userVariablePatchSchema>

export function UserVariableEditForm({
  userVariable,
  className,
  ...props
}: UserVariableEditFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(userVariablePatchSchema),
    defaultValues: {
      name: userVariable?.name || "",
    },
  })

  async function onSubmit(data: FormData) {
    const response = await fetch(`/api/userVariables/${userVariable.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
      }),
    })

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your userVariable was not updated. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "Your userVariable has been updated.",
    })

    router.back()
    router.refresh()
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>{userVariable.name}</CardTitle>
          {userVariable.description && (
            <CardDescription>{userVariable.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              className="w-full lg:w-[400px]"
              size={32}
              {...register("name")}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <button
            type="submit"
            className={cn(buttonVariants(), className)}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span>Save changes</span>
          </button>
        </CardFooter>
      </Card>
    </form>
  )
}

// Unit tests for UserVariableEditForm component
describe('UserVariableEditForm component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form with the user variable data', () => {
    const mockUserVariable = {
      id: '1',
      name: 'Test Variable',
      description: 'Test description',
    };

    const { getByLabelText, getByText } = render(
      <UserVariableEditForm userVariable={mockUserVariable} />
    );

    expect(getByText('Test Variable')).toBeInTheDocument();
    expect(getByText('Test description')).toBeInTheDocument();
    expect(getByLabelText('Name')).toHaveValue('Test Variable');
  });

  it('should update the user variable successfully', async () => {
    const mockUserVariable = {
      id: '1',
      name: 'Test Variable',
      description: 'Test description',
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
    });

    const { getByLabelText, getByRole } = render(
      <UserVariableEditForm userVariable={mockUserVariable} />
    );

    const nameInput = getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Variable' } });

    const submitButton = getByRole('button', { name: 'Save changes' });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/userVariables/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Updated Variable' }),
    });

    expect(toast).toHaveBeenCalledWith({
      description: 'Your userVariable has been updated.',
    });

    expect(router.back).toHaveBeenCalled();
    expect(router.refresh).toHaveBeenCalled();
  });

  it('should handle errors when updating the user variable', async () => {
    const mockUserVariable = {
      id: '1',
      name: 'Test Variable',
      description: 'Test description',
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
    });

    const { getByLabelText, getByRole } = render(
      <UserVariableEditForm userVariable={mockUserVariable} />
    );

    const nameInput = getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Variable' } });

    const submitButton = getByRole('button', { name: 'Save changes' });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/userVariables/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Updated Variable' }),
    });

    expect(toast).toHaveBeenCalledWith({
      title: 'Something went wrong.',
      description: 'Your userVariable was not updated. Please try again.',
      variant: 'destructive',
    });
  });
});
