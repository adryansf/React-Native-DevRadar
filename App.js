import React from "react";
import Routes from "./src/routes";
import { StatusBar } from "react-native";

export default function App() {
  return (
    <React.Fragment>
      <StatusBar barStyle="light-content" backgroundColor="#7D40E7" />
      <Routes />
    </React.Fragment>
  );
}
