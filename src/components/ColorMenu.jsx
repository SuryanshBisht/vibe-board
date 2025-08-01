import {React, useState, useEffect} from 'react';

const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

const ColorMenu = ({canvasRef}) => {
    const [brushColor, setBrushColor] = useState('#000000');
    
    const changeBrushColor = () => {
        const context = canvasRef.current.getContext('2d');
        context.strokeStyle = brushColor;              
    }
    
    useEffect(changeBrushColor, [brushColor, canvasRef]);
    return (
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            {colors.map(color => (
            <button
                key={color}
                onClick={()=>setBrushColor(color)}
                style={{
                background: color,
                width: 32,
                height: 32,
                border: brushColor === color ? '3px solid #333' : '1px solid #ccc',
                borderRadius: '50%',
                cursor: 'pointer'
                }}
                aria-label={`Select ${color} brush`}
            />
            ))}
        </div>
  )
}

export default ColorMenu;