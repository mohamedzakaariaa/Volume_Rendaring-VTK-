import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import 'bootstrap/dist/css/bootstrap.css';
import Home_page from './App';
import Chest from './chest';
import Skull from './skull';
const home=new Home_page();
const flag=home.flag_value();
swap(flag);
function swap(flag){
if (flag==2){
ReactDOM.render(
    <Home_page />
    ,document.getElementById('root'));

}else if (flag==0){
    ReactDOM.render(
        <Chest />
        ,document.getElementById('root'));
}else {
    ReactDOM.render(
        <Skull />
        ,document.getElementById('root'));
}
}
        

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
export default swap;