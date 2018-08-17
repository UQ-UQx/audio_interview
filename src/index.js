import data from "./data.json"

const items = ["item", "item", "item"]
items.map((item, index)=>console.log(`${item} ${index} + ${data.itemB}`))

import React from 'react';
import ReactDOM from 'react-dom';
import App from "./components/App"

ReactDOM.render(<App />, document.getElementById('app'));