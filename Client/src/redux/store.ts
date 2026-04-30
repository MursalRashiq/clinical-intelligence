import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
const createWebStorage = () => {
  if (typeof window !== 'undefined') {
    return {
      getItem: (key: string) => {
        return Promise.resolve(window.localStorage.getItem(key));
      },
      setItem: (key: string, value: string) => {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }
  return {
    getItem: () => Promise.resolve(null),
    setItem: (_: string, value: unknown) => Promise.resolve(value),
    removeItem: () => Promise.resolve(),
  };
};

const storage = createWebStorage();
import userReducer from './user/userSlice';
import adminReducer from './admin/adminSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['user', 'admin'], // Persist both user and admin state
};

const rootReducer = combineReducers({
    user: userReducer,
    admin: adminReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
