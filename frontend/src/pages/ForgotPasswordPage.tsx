import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Anchor,
  Box,
  ThemeIcon,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { IconBrandOpenai, IconAt, IconArrowLeft, IconCheck, IconAlertCircle } from '@tabler/icons-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API endpoint to send a password reset email
      // For now, we'll just simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Reset link sent',
        message: 'Check your email for instructions to reset your password',
        color: 'green',
      });
      
      setIsSubmitted(true);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send reset link. Please try again.',
        color: 'red',
      });
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
          Reset your password
        </Text>
      </Box>

      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="md">
          Forgot Password
        </Title>

        {isSubmitted ? (
          <Stack>
            <Alert 
              icon={<IconCheck size={16} />} 
              title="Reset link sent!" 
              color="green"
            >
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </Alert>
            <Text size="sm" c="dimmed" ta="center" mt="md">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </Text>
            <Button 
              variant="subtle" 
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/login')}
              mt="md"
            >
              Back to Login
            </Button>
          </Stack>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Text size="sm" mb="lg">
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              leftSection={<IconAt size={16} />}
              {...form.getInputProps('email')}
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
              Send Reset Link
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
} 