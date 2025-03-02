import { useRef, useEffect } from 'react';

interface Drop {
  x: number;
  y: number;
  speed: number;
  word: string;
  isSpecial: boolean;
  visibleChars: number;  // Track how many characters are currently visible
  typingDelay: number;   // Delay between typing characters
  typingTimer: number;   // Track time for typing effect
}

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Set canvas size with pixel ratio for crisp text
    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pixelRatio, pixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dataset of words and numbers
    const dataWords = [
      // Sample Datasets
      'Iris', 'Flower', 'Dataset', 'Classification', 'Titanic', 'Passengers', 'Survival',
      'Boston', 'Housing', 'Prices', 'Wine', 'Quality', 'Ratings', 'Customer', 'Churn',
      'Sales', 'Forecasting', 'Time', 'Series', 'Analytics', 'Pipeline',

      // Car Data Fields
      'Horsepower', 'Miles_per_Gallon', 'Weight_in_lbs', 'Origin', 'USA', 'Europe', 'Japan',
      'Year', 'Model', 'Engine', 'Transmission', 'Fuel', 'Efficiency', 'Performance',

      // Stock Market Terms
      'Open', 'Close', 'High', 'Low', 'Volume', 'Price', 'Market', 'Trade', 'Stock',
      'Bull', 'Bear', 'Trend', 'Rally', 'Volatility', 'Index', 'Portfolio', 'Dividend',

      // Weather Data
      'Temperature', 'Precipitation', 'Wind', 'Sunny', 'Cloudy', 'Rainy', 'Stormy',
      'Forecast', 'Humidity', 'Pressure', 'Climate', 'Weather', 'Seasonal', 'Pattern',

      // Data Analysis Terms
      'Mean', 'Median', 'Mode', 'Standard', 'Deviation', 'Variance', 'Correlation',
      'Regression', 'Distribution', 'Quartile', 'Percentile', 'Outlier', 'Sample',
      'Population', 'Hypothesis', 'Test', 'Confidence', 'Interval', 'P-Value',

      // Database Fields
      'ID', 'Name', 'Category', 'Value', 'Type', 'Status', 'Date', 'Time', 'Timestamp',
      'Count', 'Sum', 'Average', 'Minimum', 'Maximum', 'Group', 'Filter', 'Sort', 'Join',

      // Technical Terms
      'Neural', 'Network', 'Deep', 'Learning', 'Algorithm', 'Data', 'Model', 'Training',
      'Tensor', 'Vector', 'Matrix', 'Gradient', 'Epoch', 'Batch', 'Layer', 'Node',
      'Function', 'Variable', 'Class', 'Object', 'Method', 'Array', 'String', 'Boolean',
      'Promise', 'Async', 'Await', 'Thread', 'Process', 'Stream', 'Buffer', 'Socket',

      // System Commands
      'sudo rm -rf', './configure', 'make install', 'npm start', 'docker run', 'git push',
      'ssh -p 22', 'chmod +x', 'kill -9', 'ps aux', 'netstat', 'ping -c 4', 'traceroute',

      // Numbers and Calculations
      '0x0', '0x1', '0xFF', '127.0.0.1', '192.168.1.1', '255.255.255.0', '::1',
      'π', '∞', '∑', '∫', '∂', '√', 'λ', 'θ', 'Ω', 'δ', '∇', '∆', '∈', '∉',

      // Statistics
      'Row_Count:1000', 'Columns:10', 'Missing:5', 'Unique:950', 'Mean:500.5',
      'StdDev:288.675', 'Min:1', 'Max:1000', 'Median:500', 'Q1:250', 'Q3:750',

      // Project Stats
      'Projects:8', 'Workflows:5', 'Success:98.5%', 'Runtime:45m', 'Memory:2MB',
      'Duplicates:10', 'Categories:4', 'Users:156', 'Active:891', 'Total:1599',
    ];

    // Add these new arrays before the existing dataWords array
    const additionalTechWords = [
      // Programming Languages & Frameworks
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Rust', 'Go', 'Ruby', 'PHP',
      'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
      'Spring', 'Laravel', 'Kubernetes', 'Docker', 'Terraform', 'Ansible', 'Jenkins',

      // Database Technologies
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'Neo4j', 'ElasticSearch',
      'DynamoDB', 'MariaDB', 'SQLite', 'CouchDB', 'InfluxDB', 'Prometheus', 'Grafana',

      // Cloud & DevOps
      'AWS', 'Azure', 'GCP', 'Lambda', 'S3', 'EC2', 'RDS', 'CloudFront', 'Route53',
      'VPC', 'IAM', 'ECS', 'EKS', 'Fargate', 'CloudWatch', 'CloudTrail', 'CodePipeline',

      // AI & ML Libraries
      'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'NumPy', 'Pandas', 'OpenCV',
      'NLTK', 'SpaCy', 'Hugging Face', 'XGBoost', 'LightGBM', 'Rapids', 'MLflow',

      // Networking & Security
      'TCP/IP', 'HTTP/3', 'WebSocket', 'gRPC', 'GraphQL', 'OAuth2', 'JWT', 'HTTPS',
      'SSL/TLS', 'DNS', 'DHCP', 'LDAP', 'Kerberos', 'IPSec', 'OpenSSL', 'WireGuard',

      // System Architecture
      'Microservices', 'Serverless', 'Event-Driven', 'CQRS', 'Event-Sourcing', 'DDD',
      'REST', 'SOA', 'Pub/Sub', 'Message-Queue', 'Circuit-Breaker', 'Load-Balancer',

      // Development Tools
      'Git', 'VSCode', 'WebStorm', 'Postman', 'Swagger', 'Jira', 'Confluence', 'Slack',
      'npm', 'yarn', 'pnpm', 'webpack', 'Babel', 'ESLint', 'Prettier', 'Jest',

      // Binary & Hexadecimal
      '0b1010', '0b1100', '0b1111', '0b10001', '0xABCD', '0xFFFF', '0x1234', '0x5678',
      '0xAAAA', '0xBBBB', '0xCCCC', '0xDDDD', '0xEEEE', '0x9999', '0x8888', '0x7777',

      // IP Addresses & Ports
      '10.0.0.1', '172.16.0.1', '192.168.0.1', '169.254.0.1', 'fe80::1', '2001:db8::1',
      'PORT:80', 'PORT:443', 'PORT:3000', 'PORT:5432', 'PORT:27017', 'PORT:6379',

      // Version Numbers
      'v1.0.0', 'v2.1.3', 'v3.5.7', 'v4.8.2', 'v5.12.4', 'v6.15.9', 'v7.20.1', 'v8.25.6',
      'v9.30.8', 'v10.35.2', 'v11.40.5', 'v12.45.7', 'v13.50.9', 'v14.55.3', 'v15.60.8',

      // Status Codes & Errors
      '200_OK', '201_CREATED', '204_NO_CONTENT', '301_MOVED', '400_BAD_REQUEST',
      '401_UNAUTHORIZED', '403_FORBIDDEN', '404_NOT_FOUND', '500_SERVER_ERROR',
      '502_BAD_GATEWAY', '503_SERVICE_UNAVAILABLE', '504_GATEWAY_TIMEOUT',

      // Mathematical Constants
      'π:3.14159', 'e:2.71828', 'φ:1.61803', '√2:1.41421', '√3:1.73205', 'ln2:0.69314',
      'log10:2.30258', 'ζ(3):1.20205', 'γ:0.57721', 'μ:0.26149', 'α:0.00729',

      // Memory Addresses
      '0x00000000', '0xFFFFFFFF', '0x7FFFFFFF', '0x80000000', '0x0000FFFF', '0xFFFF0000',
      'HEAP:0x123', 'STACK:0x456', 'CODE:0x789', 'DATA:0xABC', 'BSS:0xDEF',
    ];

    // Combine with existing dataWords
    const allDataWords = [...dataWords, ...additionalTechWords];

    const specialWords = [
      // System Messages
      'SYSTEM_BREACH', 'ACCESS_DENIED', 'ENCRYPTED', 'DECRYPTED', 'OVERRIDE', 'BACKDOOR',
      'ROOT_ACCESS', 'KERNEL_PANIC', 'BUFFER_OVERFLOW', 'STACK_TRACE', 'MEMORY_DUMP',
      'CORE_DUMP', 'SEGMENTATION_FAULT', 'NULL_POINTER', 'DEADLOCK_DETECTED',
      'RACE_CONDITION', 'HEAP_CORRUPTION', 'STACK_OVERFLOW', 'INVALID_OPCODE',

      // Analysis Status
      'ANALYZING_DATA', 'PROCESSING_COMPLETE', 'TRAINING_MODEL', 'PREDICTION_READY',
      'VALIDATION_ERROR', 'OPTIMIZATION_FAILED', 'CONVERGENCE_ACHIEVED',
      'OUTLIERS_DETECTED', 'PATTERN_IDENTIFIED', 'CORRELATION_FOUND',

      // Security Alerts
      'SECURITY_BREACH', 'UNAUTHORIZED_ACCESS', 'INTRUSION_DETECTED', 'FIREWALL_BREACH',
      'PORT_SCAN', 'MALWARE_DETECTED', 'VIRUS_SIGNATURE', 'TROJAN_DETECTED',
      'RANSOMWARE', 'CRYPTOJACKING', 'DDoS_ATTACK', 'ZERO_DAY_EXPLOIT',

      // Data Pipeline Status
      'ETL_RUNNING', 'TRANSFORM_COMPLETE', 'LOAD_FAILED', 'VALIDATION_PASSED',
      'SCHEMA_MISMATCH', 'PIPELINE_BLOCKED', 'QUEUE_OVERFLOW', 'BATCH_PROCESSED',
      'STREAM_CONNECTED', 'CACHE_INVALIDATED', 'INDEX_REBUILT', 'BACKUP_CREATED',
    ];

    const fontSize = 20;
    const columns = Math.floor(canvas.width / (fontSize * 1.3)); // More dense columns

    const getRandomSpeed = () => {
      const speeds = [1.5, 2, 2.5]; // Consistent speeds for readability
      return speeds[Math.floor(Math.random() * speeds.length)];
    };

    const getRandomWord = (isSpecial: boolean) => {
      const words = isSpecial ? specialWords : allDataWords;
      return words[Math.floor(Math.random() * words.length)];
    };

    const createDrop = (): Drop => {
      const isSpecial = Math.random() < 0.15;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * -100,
        speed: getRandomSpeed(),
        word: getRandomWord(isSpecial),
        isSpecial,
        visibleChars: 0,
        typingDelay: Math.random() * 100 + 50, // Random delay between 50-150ms
        typingTimer: 0
      };
    };

    // Increase density of drops
    const drops: Drop[] = Array.from({ length: Math.floor(columns * 0.6) }, () => createDrop());

    let lastTime = 0;
    const draw = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Clear with solid black, no fade effect to prevent haze
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Ensure crisp text rendering
      ctx.imageSmoothingEnabled = false;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      
      drops.forEach((drop, i) => {
        // Update typing effect
        drop.typingTimer += deltaTime;
        if (drop.typingTimer >= drop.typingDelay) {
          drop.typingTimer = 0;
          if (drop.visibleChars < drop.word.length) {
            drop.visibleChars++;
          }
        }

        const chars = drop.word.slice(0, drop.visibleChars).split('');
        chars.forEach((char, j) => {
          const y = drop.y + (j * fontSize * 1.2);
          if (y > 0 && y < window.innerHeight) {
            ctx.font = `bold ${fontSize}px "Courier New", monospace`;

            if (j === chars.length - 1) { // Currently typing character
              // Bright typing effect with sharp glow
              ctx.shadowColor = drop.isSpecial ? '#ffffff' : '#00ff00';
              ctx.shadowBlur = 4;
              ctx.fillStyle = drop.isSpecial ? '#ffffff' : '#00ff00';
              ctx.fillText(char, drop.x, y);
              // Double render for emphasis
              ctx.fillText(char, drop.x, y);
            } else {
              // Previously typed characters
              ctx.shadowBlur = 0;
              const opacity = Math.max(0.9 - (j / chars.length), 0.3);
              ctx.fillStyle = drop.isSpecial ? 
                `rgba(255, 255, 255, ${opacity})` :
                `rgba(0, 255, 0, ${opacity})`;
              ctx.fillText(char, drop.x, y);
            }
          }
        });

        // Move drop
        drop.y += drop.speed;

        // Reset drop when it goes off screen or fully typed
        if (drop.y > window.innerHeight || 
            (drop.visibleChars >= drop.word.length && 
             drop.y > window.innerHeight - fontSize * drop.word.length)) {
          Object.assign(drops[i], createDrop());
        }
      });
    };

    let animationFrameId: number;
    const animate = (currentTime: number) => {
      draw(currentTime);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default MatrixBackground; 