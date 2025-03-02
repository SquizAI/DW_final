import { Box, SegmentedControl, Stack } from '@mantine/core';
import { useState } from 'react';
import MatrixRain from '../components/MatrixRain';
import MiamiMatrixRain from '../components/MiamiMatrixRain';

export function TestPage() {
  const [effect, setEffect] = useState<'classic' | 'miami'>('classic');

  return (
    <Box
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'black',
      }}
    >
      {effect === 'classic' ? <MatrixRain /> : <MiamiMatrixRain />}
      
      <Stack 
        align="center" 
        style={{ 
          position: 'fixed', 
          top: 20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 1000 
        }}
      >
        <SegmentedControl
          value={effect}
          onChange={(value) => setEffect(value as 'classic' | 'miami')}
          data={[
            { label: 'Classic Rain', value: 'classic' },
            { label: 'Miami Skyline', value: 'miami' },
          ]}
          style={{ background: 'rgba(0,0,0,0.5)' }}
        />
      </Stack>
    </Box>
  );
}

export default TestPage; 