import '@kitware/vtk.js/favicon';
import { useState, useRef, useEffect } from 'react';
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import swap from './index';

const controlPanel =`<table>
<tr>
  <td>Iso value</td>
  <td>
    <input class='isoValue' type="range" min="0.0" max="1.0" step="0.05" value="0.0" />
  </td>
</tr>
</table>

`;
function Skull(){
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  //const [isoValue, setisoValue] = useState(0.5);
  const [flag, setflag] = useState(1);

  useEffect(() => {
    if (!context.current) {
      const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
        background: [0, 0, 0],
        rootContainer: vtkContainerRef.current
      });
      const renderWindow = fullScreenRenderWindow.getRenderWindow();
     const renderer = fullScreenRenderWindow.getRenderer();
     fullScreenRenderWindow.addController(controlPanel);

     const actor = vtkActor.newInstance();
     const mapper = vtkMapper.newInstance();
  const marchingCube = vtkImageMarchingCubes.newInstance({
    contourValue: 0.0,
    computeNormals: true,
    mergePoints: true,
  });
  
  actor.setMapper(mapper);
  mapper.setInputConnection(marchingCube.getOutputPort());
  
  function updateIsoValue(e) {
  const isoValue = Number(e.target.value);
  marchingCube.setContourValue(isoValue);
    renderWindow.render();
   }
  
  const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
  marchingCube.setInputConnection(reader.getOutputPort());
  
  reader
    .setUrl(`https://kitware.github.io/vtk-js/data/volume/headsq.vti`, { loadData: true })
    .then(() => {
      const data = reader.getOutputData();
      const dataRange = data.getPointData().getScalars().getRange();
      const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;
      const el = document.querySelector('.isoValue');
      el.setAttribute('min', dataRange[0]);
      el.setAttribute('max', dataRange[1]);
      el.setAttribute('value', firstIsoValue);
      el.addEventListener('input', updateIsoValue);
  
      marchingCube.setContourValue(firstIsoValue);
      renderer.addActor(actor);
      renderer.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
      renderer.resetCamera();
      renderWindow.render();
    });
  
  global.fullScreen = fullScreenRenderWindow;
  global.actor = actor;
  global.mapper = mapper;
  global.marchingCube = marchingCube;
  context.current = {
    fullScreenRenderWindow,
    renderWindow,
    renderer,
    marchingCube,
    actor,
    mapper,
  };
}

return () => {
  if (context.current) {
    const { fullScreenRenderer, actor, mapper } = context.current;
    actor.delete();
    mapper.delete();
    fullScreenRenderer.delete();
    context.current = null;
  }
};
}, [vtkContainerRef]);


 

  useEffect(() => {
    if (context.current) {
      const{renderWindow}=context.current;
      swap(flag);
      renderWindow.render();
    }
  }, [flag]);
  return (
    <div>
      <div ref={vtkContainerRef} />
      <table
        style={{
          position: 'absolute',
          top: '25px',
          right: '25px',
          background: 'white',
          padding: '12px',
        }}
      >
        <tbody>
          <tr>
            <td>
              <select
                value={flag}
                style={{ width: '100%' }}
                onInput={(ev) => setflag(Number(ev.target.value))}
              >
                <option value="1">Skull</option>
                <option value="0">Chest</option>
                <option value="2">Home-page</option>
              </select>
            </td>
          </tr>
         
        </tbody>
      </table>
    </div>
  );
}

export default Skull;