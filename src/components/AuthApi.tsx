import React from 'react';

// State type
interface AuthContextProps {
  auth: string;
  setAuth: (token: string) => void;
  userid: number;
  setUserId: (id: number) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  userData: any[];
  setUserData: (data: any[]) => void;
  index: number;
  setIndex: (i: number) => void;
  remove: boolean;
  setRemove: (value: boolean) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dark: boolean;
  setDark: (value: boolean) => void;
}


const AuthApi = React.createContext<AuthContextProps|any>(null);
export default AuthApi;