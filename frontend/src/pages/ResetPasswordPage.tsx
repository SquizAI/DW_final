import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  PasswordInput,
  Button,
  Group,
  Stack,
  Anchor,
  Box,
  ThemeIcon,
  Alert,
  Progress,
  Popover,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { IconBrandOpenai, IconLock, IconArrowLeft, IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';

// Password strength requirements
const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
  let multiplier = password.length > 7 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      style={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? <IconCheck size={14} /> : <IconX size={14} />} <Box ml={10}>{label}</Box>
    </Text>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [popoverOpened, setPopoverOpened] = useState(false);
  
  // Get token from URL
  const token = searchParams.get('token');
  
  // Check if token is valid
  useEffect(() => {
    const validateToken = async () => {
      // In a real app, this would call an API endpoint to validate the token
      // For now, we'll just simulate a valid token if it exists
      if (!token) {
        setIsTokenValid(false);
      }
    };
    
    validateToken();
  }, [token]);

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) => (
        getStrength(value) < 50 ? 'Password is too weak' : null
      ),
      confirmPassword: (value, values) => (
        value !== values.password ? 'Passwords do not match' : null
      ),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API endpoint to reset the password
      // For now, we'll just simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Password reset successful',
        message: 'Your password has been reset successfully',
        color: 'green',
      });
      
      setIsSubmitted(true);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to reset password. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getStrength(form.values.password);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(form.values.password)}
    />
  ));
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

  if (!isTokenValid) {
    return (
      <Container size={420} my={40}>
        <Box ta="center" mb={30}>
          <ThemeIcon size={60} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
            <IconBrandOpenai size={34} />
          </ThemeIcon>
          <Title order={1} mt="md" mb={5}>Data Whisperer</Title>
          <Text c="dimmed" size="sm">
            Reset your password
          </Text>
        </Box>

        <Paper radius="md" p="xl" withBorder>
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Invalid or expired token" 
            color="red"
          >
            The password reset link is invalid or has expired. Please request a new password reset link.
          </Alert>
          <Button 
            fullWidth 
            mt="xl" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/forgot-password')}
          >
            Request New Reset Link
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Box ta="center" mb={30}>
        <ThemeIcon size={60} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
          <IconBrandOpenai size={34} />
        </ThemeIcon>
        <Title order={1} mt="md" mb={5}>Data Whisperer</Title>
        <Text c="dimmed" size="sm">
          Reset your password
        </Text>
      </Box>

      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="md">
          Reset Password
        </Title>

        {isSubmitted ? (
          <Stack>
            <Alert 
              icon={<IconCheck size={16} />} 
              title="Password reset successful!" 
              color="green"
            >
              Your password has been reset successfully. You can now log in with your new password.
            </Alert>
            <Button 
              fullWidth 
              mt="xl" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </Stack>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Text size="sm" mb="lg">
              Enter your new password below.
            </Text>

            <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
              <Popover.Target>
                <div
                  onFocusCapture={() => setPopoverOpened(true)}
                  onBlurCapture={() => setPopoverOpened(false)}
                >
                  <PasswordInput
                    required
                    label="New Password"
                    placeholder="Your new password"
                    leftSection={<IconLock size={16} />}
                    {...form.getInputProps('password')}
                  />
                </div>
              </Popover.Target>
              <Popover.Dropdown>
                <Progress color={color} value={strength} size={5} mb="xs" />
                <PasswordRequirement label="Includes at least 8 characters" meets={form.values.password.length > 7} />
                {checks}
              </Popover.Dropdown>
            </Popover>

            <PasswordInput
              required
              mt="md"
              label="Confirm Password"
              placeholder="Confirm your new password"
              leftSection={<IconLock size={16} />}
              {...form.getInputProps('confirmPassword')}
            />

            <Group justify="space-between" mt="md">
              <Anchor component={Link} to="/login" size="sm">
                <Group gap={5}>
                  <IconArrowLeft size={14} />
                  <span>Back to login</span>
                </Group>
              </Anchor>
            </Group>

            <Button fullWidth mt="xl" type="submit" loading={isLoading}>
              Reset Password
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
} 