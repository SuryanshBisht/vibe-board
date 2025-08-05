import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ColorMenu from './ColorMenu';
import BrushMenu from './BrushMenu';
import ShapeMenu from './ShapeMenu';
import {draw_shape} from '../utilities/draw_function';

const MAX_HISTORY = 10;
const MENU_HIDE_DELAY = 500; // 0.5 seconds

const Canvas = ({ width, height }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  const historyRef = useRef([]);
  const historyStepRef = useRef(-1);
  const [selectedShape, setSelectedShape] = useState(null);
  const startSelect = useRef(null);
  const endSelect = useRef(null);
  const [dashOffset, setDashOffset] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const copyRef = useRef(null);
  const mousePosRef=useRef(null);
  const selectModeRef=useRef(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const [snipList, setSnipList] = useState([]);


  useEffect(() => {
    localStorage.setItem("mySnips", JSON.stringify(snipList));
  }, [snipList]);

  const copy= () => {
    if(selectModeRef.current){
      restoreLastState();
      copyRef.current = contextRef.current.getImageData(startSelect.current[0], startSelect.current[1],
      endSelect.current[0] - startSelect.current[0], endSelect.current[1] - startSelect.current[1]);
      console.log('Copied area:', copyRef.current);
      setSelectMode(false); 
    }
  }

  const cut = () => {
    if(selectModeRef.current){
      copy(); 
      contextRef.current.clearRect(startSelect.current[0], startSelect.current[1],
      endSelect.current[0] - startSelect.current[0], endSelect.current[1] - startSelect.current[1]);
    }
  }
  
  const paste = (imageData) => {
    setSelectMode(false);
    if(imageData) {
      contextRef.current.putImageData(imageData, mousePosRef.current[0], mousePosRef.current[1]);
      saveHistory();
    }
  }

  const save_snip = () => {
    console.log('Saving snip...');
    copy();
    const snipData=copyRef.current;
    if(snipData===null) return;
    setSnipList(snipList => [...snipList, snipData]);
    console.log('Snip saved:', snipData);
    console.log('Current snip list:', snipList);
  }

  const clear_snip = () => {
    setSnipList([]);
    console.log('Snip list cleared');
  }

  useEffect(() => {
    const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
    contextRef.current = context;
    saveHistory(); // Save initial state

    // retrieve saved snips from localStorage
    const saved_snips = localStorage.getItem("mySnips");

    if (saved_snips) {
      setSnipList(JSON.parse(saved_snips));
    }

    // Keyboard event for Ctrl+Z (Undo) and Ctrl+Y (Redo)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        redo();
      }
      if(e.key=== 'Escape') {
        e.preventDefault();
        restoreLastState();
        setSelectMode(false);
        setSelectedShape(null);
        copyRef.current = null;
        console.log('Selection cleared');
        console.log(selectMode);
        console.log(selectedShape)
      }
      if((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // copy selected area
        e.preventDefault();
        copy();
      } 
      if((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        cut();
      } 
      if((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // paste copied area
        e.preventDefault();
        console.log('Copy reference:', copyRef.current);
        // console.log('Pasting copied area at:', e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        paste(copyRef.current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save current canvas state to history
  const saveHistory = () => {
    console.log('Saving history');
    const ctx = contextRef.current;
    const imageData = ctx.getImageData(0, 0, width, height);
    if(historyRef.current.length > 0) {
      const lastState = historyRef.current[historyRef.current.length - 1];
      // If the last state is the same as the current, do not save it again
      if(lastState && lastState.data.toString() === imageData.data.toString()) {
        console.log('Current state is the same as last saved state, not saving again.');
        return;
      }
    }
    // If not at the end, remove redo states
    if (historyStepRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyStepRef.current + 1);
    }
    // Add new state
    historyRef.current.push(imageData);
    // Limit history size
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    historyStepRef.current = historyRef.current.length - 1;
    console.log(`History saved. Current step: ${historyStepRef.current}, Total history: ${historyRef.current.length}`);
  };

  // restore last state
  const restoreLastState = () => {
    if (historyRef.current.length > 0) {  
      const ctx = contextRef.current;
      ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
    }
  };

  // Undo function
  const undo = () => {
    if (historyStepRef.current > 0) {
      historyStepRef.current -= 1;
      const ctx = contextRef.current;
      ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
    }
  };

  // Redo function
  const redo = () => {
    if (historyStepRef.current < historyRef.current.length - 1) {
      historyStepRef.current += 1;
      const ctx = contextRef.current;
      ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
    }
  };

  const handleMouseDown = (e) => {
    if(e.button === 2) return; // Right click should not start drawing
    if(selectMode) {
      setSelectMode(false);
      restoreLastState();
    }
    isDrawingRef.current = true;
    if(selectedShape!==null){
      startSelect.current=[e.nativeEvent.offsetX, e.nativeEvent.offsetY];
      return;
    }
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e) => {
    if(e.button === 2) return; // Right click should not start drawing
    mousePosRef.current=[e.nativeEvent.offsetX, e.nativeEvent.offsetY];
    if (!isDrawingRef.current) return;
    if(selectedShape!==null){
      endSelect.current=[e.nativeEvent.offsetX, e.nativeEvent.offsetY];
      // Restore the canvas to the last saved state before drawing the shape
      const ctx = contextRef.current;
      if (historyRef.current.length > 0) {
        ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
      }
      
      if(selectedShape === 'Select') {
        draw_shape(ctx,'Select',startSelect.current,endSelect.current,
          dashOffset, // you should animate this with requestAnimationFrame for animation
          true
        );
      }else{
        draw_shape(ctx, selectedShape, startSelect.current, endSelect.current);
      }
      return;
    }
    const ctx = contextRef.current;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const handleMouseUp = (e) => {
    if(e.button === 2) return; // Right click should not start drawing
    endSelect.current = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
    isDrawingRef.current = false;

    if (selectedShape === 'Select') {
      const ctx = contextRef.current;
      draw_shape(ctx, 'Select', startSelect.current, endSelect.current, dashOffset, false);
      setSelectedShape(null);
      setSelectMode(true);
      console.log('Selection made:', startSelect.current, endSelect.current);
      return;
    }

    setSelectedShape(null);
    saveHistory();
  };

  const handleMouseOut = () => {
    // if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if(!selectMode){
      saveHistory();
    }
  };

  const handleMenuVisible = (e) => {
    e.preventDefault();
    console.log('Right click detected');
    setMenuVisible(true);
    // Start auto-hide timer
    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setMenuVisible(false), 2000);
  }

  useEffect(() => {
    let frame;
    if (selectedShape === 'Select') {
      // Draw blur overlay and animated rectangle
      const ctx = contextRef.current;
      // this line only makes a blur effect
      draw_shape(ctx,'Select',[0,0],[0,0],
        dashOffset, // you should animate this with requestAnimationFrame for animation
        true
      );
    
      const animate = () => {
        setDashOffset((prev) => (prev + 2) % 100);
        frame = requestAnimationFrame(animate);
      };
      animate();
      return () => cancelAnimationFrame(frame);
    }
    if(selectedShape === 'Clear') {
      draw_shape(contextRef.current, 'Clear', [0, 0], [width, height]);
      setSelectedShape(null);
      saveHistory();
    }
  }, [selectedShape]);

  useEffect(()=>{
    selectModeRef.current=selectMode;
  },[selectMode])
  
  const menuItemStyle = {
    padding: "8px 20px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    userSelect: "none",
    fontSize: "14px", 
    color: "#333",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "start",
    justifyContent: "flex-start",
    hover: {
      backgroundColor: "#eee",
    },
  };

  const handleMouseEnter = () => {
    clearTimeout(hideTimeoutRef.current); // Cancel auto-hide when hovering
  };

  const handleMouseLeave = () => {
    // Restart timer when user leaves menu
    hideTimeoutRef.current = setTimeout(() => setMenuVisible(false), MENU_HIDE_DELAY);
  };

  // Click outside = hide menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuVisible(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <ShapeMenu selectedShape={selectedShape} onSelectShape={setSelectedShape} />
      <div style={{position: 'relative'}}>
      <canvas
        ref={canvasRef}
        id="whiteboard-canvas"
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        onContextMenu={handleMenuVisible}
        style={{ border: '1px solid #000', background: '#fff' , cursor: selectedShape ? 'crosshair' : 'default'}}
      ></canvas>
     
      {menuVisible && (
        <div
          ref={menuRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "absolute",
            top: mousePosRef.current[1],
            left: mousePosRef.current[0],
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            borderRadius: "4px",
            padding: "5px 0",
            display: "flex",
            flexDirection: "column",
            alignitems: "flex-start",
            zIndex: 1000,
          }}
        >
          <div style={menuItemStyle} onClick={()=>{copy(); setMenuVisible(false);}}>🔗Copy(Ctrl+C)</div>
          <div style={menuItemStyle} onClick={()=>{cut(); setMenuVisible(false);}}>✂️Cut(Ctrl+X)</div>
          <div style={menuItemStyle} onClick={()=>{paste(copyRef.current); setMenuVisible(false);}}>📋Paste(Ctrl+V)</div>
          <div style={menuItemStyle} onClick={()=>{save_snip(); setMenuVisible(false);}}>📋Save-Snip</div>
          <div style={menuItemStyle} onClick={()=>{clear_snip(); setMenuVisible(false);}}>📋Clear-Snips</div>
          {
            snipList.map(
              (snip,index)=>(
                <div style={menuItemStyle} onClick={()=>{paste(snip); setMenuVisible(false)}}>Snip-{index}</div>
              )
            )
          }
        </div>
      )}
      
      </div>
      <ColorMenu canvasRef={canvasRef}/>
      <BrushMenu canvasRef={canvasRef}/>
    </>
  );
};

Canvas.propTypes = { 
  draw: PropTypes.func,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};


export default Canvas;