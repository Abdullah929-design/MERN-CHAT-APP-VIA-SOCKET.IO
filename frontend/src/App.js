import './App.css';
import { Switch, Route } from "react-router-dom";
import React from 'react';
import Homepage from './pages/Homepage';
import Chatpage from './pages/ChatPage';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" component={Homepage} exact />
        <Route path="/chats" component={Chatpage} />
      </Switch>
    </div>
  );
}

export default App;