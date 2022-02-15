import { F } from '@kitware/vtk.js/Common/Core/Math/index';
import React, { Component } from 'react';
import swap from './index';
class Home_page extends Component {
    state={
        flag:2
    };
    constructor(){
        super();

    };
    render() { 
            return (
            <div className='landing'>
              <div className='overlay'>
              <div className="text">
                    <div className="content">
                        <h2>Volume Rendering Web App With VTK.js & React.js & HTML<br/><br/>
                            Features:
                        </h2>
                        <ol>
                          <li>Switch between chest and skull with select box.</li>
                          <li>Surface rendering with adjustable iso value.</li>
                          <li>Ray casting rendering with a fixed transfer function.</li>
                          <li>Adjustable transfer function.</li>
                          <li>Cut the volume in the three perpendicular planes.</li>

                        </ol>
                    </div>
                </div>
                <div className="container">
            <h1>Volume Rendering (VTK)</h1>
            <nav>
                <select value={0} onChange={(e) => this.handleClick(e.target.value)}>
                      <option value={0}>..</option>
            <option value={0}>chest</option>
            <option value={1}>Skull</option>
            </select>
            </nav>
        </div>
              </div>
              </div>
                  );
        }
    flag_value(){
        return this.state.flag;
    }
     handleClick = (flag) => {
         this.state.flag=flag;
         swap(flag);
}
}


// (e) => this.handleClick(e.target.value)
export default Home_page;