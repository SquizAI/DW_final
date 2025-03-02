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
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, Link } from 'react-router-dom';
import { IconBrandOpenai, IconAt, IconLock, IconUser, IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    validate: {
      name: (value) => (value.length >= 2 ? null : 'Name must be at least 2 characters'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
      terms: (value) => (value ? null : 'You must accept the terms and conditions'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      await register(values.name, values.email, values.password);
      
      // Clear onboarding flag to ensure the onboarding modal shows
      localStorage.removeItem('onboardingCompleted');
      
      // Navigate to welcome page instead of dashboard
      navigate('/welcome');
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Registration error:', error);
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
          Create an account to start your data journey
        </Text>
      </Box>

      <Paper radius="md" p="xl" withBorder>
        <Text size="lg" fw={500} ta="center" mb="md">
          Create your Data Whisperer account
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label="Name"
              placeholder="Your name"
              leftSection={<IconUser size={16} />}
              {...form.getInputProps('name')}
            />

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

            <PasswordInput
              required
              label="Confirm Password"
              placeholder="Confirm your password"
              leftSection={<IconLock size={16} />}
              {...form.getInputProps('confirmPassword')}
            />

            <Checkbox
              label="I agree to the terms and conditions"
              {...form.getInputProps('terms', { type: 'checkbox' })}
            />
          </Stack>

          <Group justify="space-between" mt="md">
            <Anchor component={Link} to="/login" size="sm">
              Already have an account? Login
            </Anchor>
          </Group>

          <Button fullWidth mt="xl" type="submit" loading={isLoading}>
            Register
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
      </Paper>
    </Container>
  );
} 