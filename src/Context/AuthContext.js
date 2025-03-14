import React, { createContext, useState } from "react";

export const AuthContext = createContext({});

function AuthProvider ({ children }) {

    const [musicsList, setMusicList] = useState([]);

    return (
        <AuthContext.Provider value={{ musicsList, setMusicList }}>
            { children }
        </AuthContext.Provider>
    )
}

export default AuthProvider;