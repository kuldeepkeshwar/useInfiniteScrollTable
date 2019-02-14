import React from "react";
import ReactDOM from "react-dom";
import "./mocks";
import "./styles.scss";
import Table from "./Table";

function App() {
  return (
    <div className="App">
      <Table />
    </div>
  );
}
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
