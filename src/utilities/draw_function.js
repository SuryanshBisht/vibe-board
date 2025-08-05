export const blur_background=(ctx, canvasWidth, canvasHeight)=>{
    // Draw semi-transparent overlay over whole canvas
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#dbeafe";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
}

export function blur_background_skip_rect(ctx, canvasWidth, canvasHeight, skipRect) {
  const { left, top, width, height } = skipRect;

  // Save context state
  ctx.save();

  // Create a path for the whole canvas
  ctx.beginPath();
  ctx.rect(0, 0, canvasWidth, canvasHeight);

  // Create a path for the rectangle to skip
  ctx.moveTo(left, top);
  ctx.rect(left, top, width, height);

  // Use evenodd rule to exclude the skip rectangle
  ctx.clip('evenodd');

  // Draw the overlay only outside the skip rectangle
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = "#dfdbfeff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Restore context state
  ctx.restore();
}
export function draw_shape(ctx, shape, start, end, dashOffset = 0, showBlur) {
  const x1 = start[0], y1 = start[1];
  const x2 = end[0], y2 = end[1];

  switch (shape) {
    case 'Select': {
      ctx.save();
      const left = Math.min(x1, x2);
      const top = Math.min(y1, y2);
      const rectWidth = Math.abs(x2 - x1);
      const rectHeight = Math.abs(y2 - y1);

      
      // Clear overlay inside the selection rectangle (makes it "clearer")
      if(showBlur){
        blur_background_skip_rect(ctx, ctx.canvas.width, ctx.canvas.height, {
          left,
          top,
          width: rectWidth,
          height: rectHeight
        });
      } 
    //   ctx.save();
    //   ctx.clearRect(left, top, rectWidth, rectHeight);
    //   ctx.restore();

      // Draw animated dashed rectangle border
      ctx.save();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.lineDashOffset = dashOffset;
      ctx.beginPath();
      ctx.rect(left, top, rectWidth, rectHeight);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'Rectangle':
      ctx.beginPath();
      ctx.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
      ctx.stroke();
      break;
    case 'Line':
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      break;
    case 'Arrow':
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Arrow head
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headlen = 10;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
      break;
    case 'Ellipse':
      ctx.beginPath();
      const left = Math.min(x1, x2);
      const top = Math.min(y1, y2);
      const rectWidth = Math.abs(x2 - x1);
      const rectHeight = Math.abs(y2 - y1);
      ctx.ellipse(
        left + rectWidth / 2,
        top + rectHeight / 2,
        rectWidth / 2,
        rectHeight / 2,
        0,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      break;
    default:
      break;
    case 'Clear':
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      break;
  }
}
