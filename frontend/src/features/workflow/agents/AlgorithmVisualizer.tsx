import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Stack,
  Text,
  Group,
  ThemeIcon,
  Button,
  Slider,
  ActionIcon,
  Box,
  Code,
  Tooltip,
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconRepeat,
} from '@tabler/icons-react';

interface AlgorithmStep {
  description: string;
  code?: string;
  visualization?: React.ReactNode;
}

interface AlgorithmVisualizerProps {
  name: string;
  steps: AlgorithmStep[];
  onComplete?: () => void;
}

export function AlgorithmVisualizer({ name, steps, onComplete }: AlgorithmVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev === steps.length - 1) {
            setIsPlaying(false);
            onComplete?.();
            return prev;
          }
          return prev + 1;
        });
      }, 2000 / playbackSpeed);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, steps.length, onComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <Stack gap="md">
      <Paper withBorder p="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500}>{name} - Step {currentStep + 1}/{steps.length}</Text>
            <Group gap="xs">
              <Tooltip label="Previous Step">
                <ActionIcon
                  variant="light"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                >
                  <IconPlayerTrackPrev size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={isPlaying ? "Pause" : "Play"}>
                <ActionIcon
                  variant="light"
                  color={isPlaying ? "orange" : "blue"}
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <IconPlayerPause size={16} />
                  ) : (
                    <IconPlayerPlay size={16} />
                  )}
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Next Step">
                <ActionIcon
                  variant="light"
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                >
                  <IconPlayerTrackNext size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Reset">
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={handleReset}
                >
                  <IconRepeat size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          <Box>
            <Text size="sm" fw={500} mb="xs">Playback Speed</Text>
            <Slider
              value={playbackSpeed}
              onChange={setPlaybackSpeed}
              min={0.5}
              max={2}
              step={0.5}
              marks={[
                { value: 0.5, label: '0.5x' },
                { value: 1, label: '1x' },
                { value: 1.5, label: '1.5x' },
                { value: 2, label: '2x' },
              ]}
            />
          </Box>
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="md">
          <Text fw={500}>Current Step</Text>
          <Text>{steps[currentStep].description}</Text>
          {steps[currentStep].code && (
            <Code block>{steps[currentStep].code}</Code>
          )}
          {steps[currentStep].visualization && (
            <Box mt="md">
              {steps[currentStep].visualization}
            </Box>
          )}
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Text fw={500}>Progress</Text>
          <Group gap="xs">
            {steps.map((_, index) => (
              <ThemeIcon
                key={index}
                size="md"
                variant={index === currentStep ? "filled" : "light"}
                color={
                  index < currentStep ? "green" :
                  index === currentStep ? "blue" :
                  "gray"
                }
                style={{ cursor: 'pointer' }}
                onClick={() => setCurrentStep(index)}
              >
                {index + 1}
              </ThemeIcon>
            ))}
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
} 