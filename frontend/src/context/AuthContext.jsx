import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  talentProfile: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, user: action.user, token: action.token, talentProfile: action.talentProfile, loading: false };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.user } };
    case 'UPDATE_TALENT_PROFILE':
      return { ...state, talentProfile: action.talentProfile };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Bootstrap from localStorage
  useEffect(() => {
    const token = localStorage.getItem('lg_token');
    if (token) {
      authAPI.getMe()
        .then(({ data }) => {
          dispatch({ type: 'SET_AUTH', user: data.user, token, talentProfile: data.talentProfile });
        })
        .catch(() => {
          localStorage.removeItem('lg_token');
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('lg_token', data.token);
    dispatch({ type: 'SET_AUTH', user: data.user, token: data.token, talentProfile: null });
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('lg_token', data.token);
    dispatch({ type: 'SET_AUTH', user: data.user, token: data.token, talentProfile: null });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lg_token');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((user) => {
    dispatch({ type: 'UPDATE_USER', user });
  }, []);

  const updateTalentProfile = useCallback((talentProfile) => {
    dispatch({ type: 'UPDATE_TALENT_PROFILE', talentProfile });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, updateTalentProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
