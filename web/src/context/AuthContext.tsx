import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    user: any | null;
    login: (token: string, user: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        const storedUser = localStorage.getItem('adminUser');
        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (newToken: string, newUser: any) => {
        localStorage.setItem('adminToken', newToken);
        localStorage.setItem('adminUser', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token, token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
