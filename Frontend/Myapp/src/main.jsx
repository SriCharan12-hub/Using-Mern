import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./App.css"
import { BrowserRouter } from 'react-router-dom'
import { Provider } from "react-redux";
import Store from './Store.js'
import { fetchCart } from './Slice';
import { GoogleOAuthProvider } from '@react-oauth/google'
const client_id = "490395676475-eoifp4dm7r3d40od0qs75dtm3gbffokn.apps.googleusercontent.com"

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={Store}>
        <GoogleOAuthProvider clientId={client_id}>
          <App />
        </GoogleOAuthProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);

if (Store.dispatch) {
  Store.dispatch(fetchCart());
}
