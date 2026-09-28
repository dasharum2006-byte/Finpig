import React from 'react';
import BudgetPlanScreen from './BudgetPlanScreen';

export default function BudgetResultScreen({ navigation }) {
  return (
    <BudgetPlanScreen
      mode="result"
      onFinish={() => {
        navigation.replace('NewBudgetPlan');
      }}
    />
  );
}