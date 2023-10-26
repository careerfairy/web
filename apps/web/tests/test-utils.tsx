import React, { FC, ReactElement } from "react"
import { render, RenderOptions } from "@testing-library/react"
import { AuthProvider } from "../HOCs/AuthProvider"
import { store } from "../pages/_app"
import firebaseApp from "../data/firebase/FirebaseInstance"

import { Provider } from "react-redux"
import { firebaseServiceInstance } from "../data/firebase/FirebaseService"
import { ReactReduxFirebaseProvider } from "react-redux-firebase"

import FirebaseServiceContext from "../context/firebase/FirebaseServiceContext"
import { createFirestoreInstance } from "redux-firestore"
import { RouterContext } from "next/dist/shared/lib/router-context"
import { NextRouter } from "next/router"
import { ThemeProviderWrapper } from "../context/theme/ThemeContext"

const rrfConfig = {
   useFirestoreForProfile: true, // Firestore for Profile instead of Realtime DB
   attachAuthIsReady: true, // attaches auth is ready promise to store
}

const rrfProps = {
   firebase: firebaseApp,
   config: rrfConfig,
   dispatch: store.dispatch,
   createFirestoreInstance,
}

const AllTheProviders: FC = ({ children }) => {
   return (
      <RouterContext.Provider value={{ ...mockRouter }}>
         <Provider store={store}>
            <AuthProvider>
               <ThemeProviderWrapper>
                  <ReactReduxFirebaseProvider {...rrfProps}>
                     <FirebaseServiceContext.Provider
                        value={firebaseServiceInstance}
                     >
                        {children}
                     </FirebaseServiceContext.Provider>
                  </ReactReduxFirebaseProvider>
               </ThemeProviderWrapper>
            </AuthProvider>
         </Provider>
      </RouterContext.Provider>
   )
}

const mockRouter: NextRouter = {
   isLocaleDomain: false,
   get isPreview(): boolean {
      return false
   },
   isReady: false,
   basePath: "",
   pathname: "/",
   route: "/",
   asPath: "/",
   query: {},
   push: jest.fn(),
   replace: jest.fn(),
   reload: jest.fn(),
   back: jest.fn(),
   forward: jest.fn(),
   prefetch: jest.fn(),
   beforePopState: jest.fn(),
   events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
   },
   isFallback: false,
}

const customRender = (
   ui: ReactElement,
   options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }
