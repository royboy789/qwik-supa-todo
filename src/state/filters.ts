import { createContext } from "@builder.io/qwik";

type taskFilters = "completed" | "incomplete" | "all";

export interface FilterContextProps { 
  taskFilter: taskFilters;
  tagFilter?: string[];
  dateRange: { 
    start: string; 
    end: string 
  } 
}

export const filterContext = createContext<FilterContextProps>('filterContext');