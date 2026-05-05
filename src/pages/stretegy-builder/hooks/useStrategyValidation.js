// src/hooks/useStrategyValidation.js
import { useMemo } from "react";
import { validateStrategy } from "../strategyValidator";

export function useStrategyValidation(nodes, edges) {
  return useMemo(() => validateStrategy(nodes, edges), [nodes, edges]);
}