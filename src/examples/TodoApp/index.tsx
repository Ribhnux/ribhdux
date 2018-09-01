import React from "react";
import { render } from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import Ribhdux from "../../";

// const store = createStore(rootReducer);
// const App = Ribhdux.Manage(<App />);

{
  /* <Provider store={store}>
    <App />
  </Provider>, */
}

render(App, document.getElementById("root"));
