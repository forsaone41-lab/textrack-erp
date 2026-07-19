import { createContext, useContext } from 'react';

export const StoreBuilderContext = createContext<any>(null);

export const useStoreBuilder = () => {
    const context = useContext(StoreBuilderContext);
    if (!context) {
        throw new Error("useStoreBuilder must be used within a StoreBuilderContext.Provider");
    }
    return context;
};
