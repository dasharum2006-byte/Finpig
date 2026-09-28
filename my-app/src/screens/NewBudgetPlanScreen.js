import React from 'react';
import BudgetPlanScreen from './BudgetPlanScreen';
import { useBudgetPlan } from '../context/BudgetPlanContext';

export default function NewBudgetPlanScreen({ navigation }) {
  const budgetPlanCtx = useBudgetPlan();

  return (
    <BudgetPlanScreen
      mode="plan"
      onFinish={() => {
        budgetPlanCtx.finishPeriod?.();
        navigation.navigate('Home');
      }}
    />
  );
}