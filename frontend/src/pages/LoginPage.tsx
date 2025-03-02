import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Divider,
  Stack,
  Anchor,
  Box,
  ThemeIcon,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate, Link } from 'react-router-dom';
import { IconBrandOpenai, IconAt, IconLock, IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      
      // Check if user has completed onboarding
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');
      
      // If onboarding is not completed, navigate to welcome page
      if (!onboardingCompleted) {
        navigate('/welcome');
      } else {
        // Otherwise, go to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login('john@example.com', 'password123');
      
      // For demo login, always show the dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Box ta="center" mb={30}>
        <ThemeIcon size={60} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
          <IconBrandOpenai size={34} />
        </ThemeIcon>
        <Title order={1} mt="md" mb={5}>Data Whisperer</Title>
        <Text c="dimmed" size="sm">
          Unlock the secrets hidden in your data
        </Text>
      </Box>

      <Paper radius="md" p="xl" withBorder>
        <Text size="lg" fw={500} ta="center" mb="md">
          Welcome back to Data Whisperer
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              leftSection={<IconAt size={16} />}
              {...form.getInputProps('email')}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              leftSection={<IconLock size={16} />}
              {...form.getInputProps('password')}
            />
          </Stack>

          <Group justify="space-between" mt="md">
            <Anchor component={Link} to="/register" size="sm">
              Don't have an account? Register
            </Anchor>
            <Anchor component={Link} to="/forgot-password" size="sm">
              Forgot password?
            </Anchor>
          </Group>

          <Button fullWidth mt="xl" type="submit" loading={isLoading}>
            Sign in
          </Button>
        </form>

        <Divider label="Or continue with" labelPosition="center" my="lg" />

        <Group grow mb="md">
          <Button variant="default" leftSection={<IconBrandGoogle size={16} />}>
            Google
          </Button>
          <Button variant="default" leftSection={<IconBrandGithub size={16} />}>
            GitHub
          </Button>
        </Group>

        <Button 
          variant="light" 
          color="blue" 
          fullWidth 
          onClick={handleDemoLogin}
          loading={isLoading}
        >
          Try Demo Account
        </Button>
      </Paper>
    </Container>
  );
} 