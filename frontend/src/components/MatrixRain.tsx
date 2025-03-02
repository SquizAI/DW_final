import { useRef, useEffect } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Matrix characters (katakana + latin + digits)
    const chars = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Set up the columns
    const fontSize = 16;
    let columns: number[]; // Array to store the current y position of each column
    let drops: number[];  // Array to store the current character index for each column

    // Configure canvas and columns
    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Calculate number of columns based on canvas width
      const columnCount = Math.floor(canvas.width / fontSize);
      columns = Array(columnCount).fill(0);
      drops = Array(columnCount).fill(0);

      // Set font once
      ctx.font = `${fontSize}px monospace`;
    };

    initCanvas();

    // Draw function
    const draw = () => {
      // Add a semi-transparent black rectangle on top of previous frame
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set color and font for matrix characters
      ctx.fillStyle = '#4169E1'; // Royal Blue

      // Loop over each column
      columns.forEach((y, i) => {
        // Generate random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Calculate x position
        const x = i * fontSize;

        // Draw the character
        // First character in column is brighter
        if (y === drops[i] * fontSize) {
          ctx.fillStyle = '#87CEEB'; // Sky Blue for leading character
          ctx.fillText(char, x, y);
          ctx.fillStyle = '#4169E1'; // Back to Royal Blue
        } else {
          // Create fade effect with royal blue
          const alpha = 1 - (y - drops[i] * fontSize) / (20 * fontSize);
          ctx.fillStyle = `rgba(65, 105, 225, ${alpha})`; // Royal Blue with alpha
          ctx.fillText(char, x, y);
        }

        // Move drop down
        columns[i] = y + fontSize;

        // Reset drop to top after it reaches bottom
        if (y > canvas.height && Math.random() > 0.975) {
          columns[i] = 0;
          drops[i] = 0;
        }

        // Increment character index
        if (y === drops[i] * fontSize) {
          drops[i]++;
        }
      });
    };

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      initCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'black',
      }}
    />
  );
};

export default MatrixRain; 