import { Text, Container, ActionIcon, Group, rem, Anchor, Divider, Stack } from '@mantine/core';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram, IconBrain, IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const links = [
  { link: '/help', label: 'Help Center' },
  { link: 'https://docs.datawhisperer.app', label: 'Documentation' },
  { link: '/blog', label: 'Blog' },
  { link: '/about', label: 'About' },
  { link: '/pricing', label: 'Pricing' },
  { link: '/contact', label: 'Contact' },
  { link: '/privacy', label: 'Privacy' },
  { link: '/terms', label: 'Terms' },
];

export function Footer() {
  const navigate = useNavigate();
  
  const items = links.map((link) => (
    <Anchor
      c="dimmed"
      key={link.label}
      onClick={(event) => {
        event.preventDefault();
        if (link.link.startsWith('http')) {
          window.open(link.link, '_blank');
        } else {
          navigate(link.link);
        }
      }}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div style={{ marginTop: 'auto' }}>
      <Divider />
      <Container py="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap={8} align="center">
              <IconBrain size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <Text fw={700} size="lg">Data Whisperer</Text>
            </Group>
            
            <Group gap="xs" justify="flex-end" wrap="nowrap">
              <ActionIcon size="lg" variant="subtle" radius="xl">
                <IconBrandTwitter style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" variant="subtle" radius="xl">
                <IconBrandYoutube style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" variant="subtle" radius="xl">
                <IconBrandInstagram style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" variant="subtle" radius="xl">
                <IconBrandGithub style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" variant="subtle" radius="xl">
                <IconBrandLinkedin style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
              </ActionIcon>
            </Group>
          </Group>
          
          <Group gap="lg" justify="center">
            {items}
          </Group>
          
          <Text c="dimmed" size="sm" ta="center">
            © {new Date().getFullYear()} Data Whisperer. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </div>
  );
} 