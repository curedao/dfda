import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { render, screen } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { Shell } from "@/components/layout/shell"
import { DashboardHeader } from "@/components/pages/dashboard/dashboard-header"
import { UserVariableCharts } from '@/components/userVariable/user-variable-charts';

describe('UserVariableChart component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });
  
  it('fetches user variable data', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([{ id: 1, name: 'Test Var' }]));
    
    render(<UserVariableChart params={{variableId: '1'}} />);

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/dfda/userVariables?variableId=1&includeCharts=true`  
    );
  });

  it('renders not found when user variable does not exist', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));

    render(<UserVariableChart params={{variableId: '1'}} />);

    expect(await screen.findByText('Not Found')).toBeInTheDocument();
  });

  it('renders UserVariableCharts with user variable', async () => {
    const userVariable = {
      id: 1,
      name: 'Test Var',
      charts: {
        lineChartWithoutSmoothing: {
          highchartConfig: {}
        }
      }
    };
    fetchMock.mockResponseOnce(JSON.stringify([userVariable]));

    render(<UserVariableChart params={{variableId: '1'}} />);

    expect(await screen.findByText('Test Var')).toBeInTheDocument();
  });
});

export const metadata: Metadata = {
  title: "UserVariable Charts",
}

interface UserVariableEditProps {
  params: { variableId: string }
}

export default async function UserVariableChart({ params }: UserVariableEditProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/signin")
  }

  const response = await fetch(
    `/api/dfda/userVariables?variableId=${params.variableId}&includeCharts=true`)
  const userVariables = await response.json()
  const userVariable = userVariables[0]

  if (!userVariable) {
    notFound()
  }

  return (
    <Shell>
      <DashboardHeader
        heading="UserVariable Settings"
        text="Modify userVariable details."
      />
      <div className="grid grid-cols-1 gap-10">
        <UserVariableCharts
          userVariable={userVariable}
        />
      </div>
    </Shell>
  )
}
