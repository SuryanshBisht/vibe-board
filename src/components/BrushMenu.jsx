import React, { useState, useEffect } from 'react';
import {brushes} from '../data/data';

const BrushMenu = ({ canvasRef }) => {
  const [brush, setBrush] = useState(brushes[0]);
  useEffect(() => {
    const context = canvasRef.current.getContext('2d', {willreadFrequently: true});
    context.lineWidth = brush.width;
    // You can add more style changes here if needed
  }, [brush, canvasRef]);

  return (
    <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
      {brushes.map(b => (
        <button
          key={b.name}
          onClick={() => setBrush(b)}
          style={{
            width: 40,
            height: 40,
            fontSize: 22,
            border: brush.name === b.name ? '3px solid #333' : '1px solid #ccc',
            borderRadius: '50%',
            background: '#f9f9f9',
            cursor: 'pointer'
          }}
          aria-label={`Select ${b.name} brush`}
          title={b.name}
        >
          {b.icon}
        </button>
      ))}
    </div>
  );
};

export default BrushMenu;