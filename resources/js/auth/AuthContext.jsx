import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const rolePresets = {
    streamer: {
        name: 'Demo Streamer',
        roles: ['streamer', 'donor'],
    },
    donor: {
        name: 'Guest Donor',
        roles: ['donor'],
    },
    admin: {
        name: 'Admin User',
        roles: ['admin', 'moderator'],
    },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const value = useMemo(
        () => ({
            user,
            loginAs(role) {
                const preset = rolePresets[role];
                if (preset) {
                    setUser({ ...preset, activeRole: role });
                }
            },
            logout() {
                setUser(null);
            },
        }),
        [user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}