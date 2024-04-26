import React from 'react';
import { render } from '@testing-library/react';
import { NutritionFactsLabel } from './NutritionFactsLabel';

describe('NutritionFactsLabel component', () => {
  it('should render the component with the correct food item', () => {
    const sampleData = {
      foodItem: 'Sample Food',
      servingSize: '100g',
      calories: 200,
      totalFat: 10,
      saturatedFat: 5,
      transFat: 0,
      cholesterol: 20,
      sodium: 500,
      totalCarbohydrate: 30,
      dietaryFiber: 5,
      sugars: 10,
      protein: 15,
      vitaminA: 10,
      vitaminC: 20,
      calcium: 15,
      iron: 5,
    };

    const { getByText } = render(<NutritionFactsLabel data={sampleData} />);

    expect(getByText('Sample Food')).toBeInTheDocument();
    expect(getByText('Serving Size 100g')).toBeInTheDocument();
    expect(getByText('Calories 200')).toBeInTheDocument();
    expect(getByText('Total Fat 10g')).toBeInTheDocument();
    expect(getByText('Saturated Fat 5g')).toBeInTheDocument();
    expect(getByText('Trans Fat 0g')).toBeInTheDocument();
    expect(getByText('Cholesterol 20mg')).toBeInTheDocument();
    expect(getByText('Sodium 500mg')).toBeInTheDocument();
    expect(getByText('Total Carbohydrate 30g')).toBeInTheDocument();
    expect(getByText('Dietary Fiber 5g')).toBeInTheDocument();
    expect(getByText('Sugars 10g')).toBeInTheDocument();
    expect(getByText('Protein 15g')).toBeInTheDocument();
    expect(getByText('Vitamin A 10%')).toBeInTheDocument();
    expect(getByText('Vitamin C 20%')).toBeInTheDocument();
    expect(getByText('Calcium 15%')).toBeInTheDocument();
    expect(getByText('Iron 5%')).toBeInTheDocument();
  });

  it('should render the component with missing data', () => {
    const sampleData = {
      foodItem: 'Sample Food',
      servingSize: '100g',
      calories: 200,
      totalFat: 10,
      saturatedFat: 5,
      transFat: 0,
      cholesterol: 20,
      sodium: 500,
      totalCarbohydrate: 30,
      dietaryFiber: 5,
      sugars: 10,
      protein: 15,
    };

    const { getByText } = render(<NutritionFactsLabel data={sampleData} />);

    expect(getByText('Sample Food')).toBeInTheDocument();
    expect(getByText('Serving Size 100g')).toBeInTheDocument();
    expect(getByText('Calories 200')).toBeInTheDocument();
    expect(getByText('Total Fat 10g')).toBeInTheDocument();
    expect(getByText('Saturated Fat 5g')).toBeInTheDocument();
    expect(getByText('Trans Fat 0g')).toBeInTheDocument();
    expect(getByText('Cholesterol 20mg')).toBeInTheDocument();
    expect(getByText('Sodium 500mg')).toBeInTheDocument();
    expect(getByText('Total Carbohydrate 30g')).toBeInTheDocument();
    expect(getByText('Dietary Fiber 5g')).toBeInTheDocument();
    expect(getByText('Sugars 10g')).toBeInTheDocument();
    expect(getByText('Protein 15g')).toBeInTheDocument();
    expect(getByText('Vitamin A -')).toBeInTheDocument();
    expect(getByText('Vitamin C -')).toBeInTheDocument();
    expect(getByText('Calcium -')).toBeInTheDocument();
    expect(getByText('Iron -')).toBeInTheDocument();
  });
});