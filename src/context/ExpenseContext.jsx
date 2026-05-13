import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadExpenses, saveExpenses } from '../utils/storage';
import { generateId } from '../utils/formatters';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../utils/categories';
import { supabase } from '../utils/supabaseClient';

const ExpenseContext = createContext();

export const calculatePlanInfo = (profile) => {
  if (!profile) return null;
  const startedDate = new Date(profile.plan_started_at || profile.created_at);
  const now = new Date();
  const diffDays = Math.floor(Math.abs(now - startedDate) / (1000 * 60 * 60 * 24));
  
  let duration = 30;
  let planName = 'Gratis';
  let planColor = 'var(--text-muted)';
  
  if (profile.plan === 'mensual') {
    duration = 30;
    planName = 'Mensual Premium';
    planColor = 'var(--accent)';
  } else if (profile.plan === 'anual') {
    duration = 365;
    planName = 'Anual Premium';
    planColor = 'var(--success)';
  }
  
  const remaining = duration - diffDays;
  return { planName, remaining, duration, planColor, email: profile.email };
};

function expenseReducer(state, action) {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return { ...state, expenses: [{ ...action.payload, id: generateId() }, ...state.expenses] };
    case 'EDIT_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: { category: 'all', month: new Date().getMonth(), year: new Date().getFullYear(), day: '', payment: 'all' } };
    case 'SET_EDITING':
      return { ...state, editingExpense: action.payload };
    case 'LOGIN':
      localStorage.setItem('auth', 'true');
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      localStorage.removeItem('auth');
      return { ...state, isAuthenticated: false };
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return { ...state, theme: newTheme };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload, planInfo: calculatePlanInfo(action.payload) };
    case 'ADD_CATEGORY':
      const updatedCats = [...state.categories, action.payload];
      localStorage.setItem('categories', JSON.stringify(updatedCats));
      return { ...state, categories: updatedCats };
    case 'DELETE_CATEGORY':
      const filteredCats = state.categories.filter(c => c.id !== action.payload);
      localStorage.setItem('categories', JSON.stringify(filteredCats));
      return { ...state, categories: filteredCats };
    default:
      return state;
  }
}

const initialState = {
  expenses: loadExpenses(),
  currentView: 'dashboard',
  editingExpense: null,
  isAuthenticated: localStorage.getItem('auth') === 'true',
  user: null,
  userProfile: null,
  planInfo: null,
  theme: localStorage.getItem('theme') || 'light',
  categories: JSON.parse(localStorage.getItem('categories')) || DEFAULT_CATEGORIES,
  filters: {
    category: 'all',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    day: '',
    payment: 'all',
  },
};

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (state.user) {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });

        if (!error && data) {
          dispatch({ type: 'SET_EXPENSES', payload: data });
        }
      }
    };
    fetchExpenses();
  }, [state.user]);

  useEffect(() => {
    if (!state.user) {
      saveExpenses(state.expenses);
    }
  }, [state.expenses, state.user]);

  return (
    <ExpenseContext.Provider value={{ state, dispatch }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within ExpenseProvider');
  return context;
}
