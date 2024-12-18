import { useState } from 'react';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { Button, Card, Container, Text, Group, Alert } from '@mantine/core';

export default function Home() {
  const [showStatus, setShowStatus] = useState(false);
  const { data, error, isLoading, refetch } = useHealthCheck();

  return (
    <Container size="lg" py="xl">
      <Card shadow="sm" padding="lg">
        <Text size="xl" weight={700} mb="md">
          Document Analysis System
        </Text>

        <Group>
          <Button
            onClick={() => {
              setShowStatus(true);
              refetch();
            }}
            disabled={isLoading}
          >
            Check API Status
          </Button>
        </Group>

        {showStatus && (
          <div style={{ marginTop: '1rem' }}>
            {isLoading && (
              <Alert title="Checking..." color="blue">
                Checking API status...
              </Alert>
            )}

            {error && (
              <Alert title="Error" color="red">
                Error connecting to API. Please ensure the backend server is
                running.
              </Alert>
            )}

            {data && (
              <Alert title="Success" color="green">
                API Status: {data.status}
              </Alert>
            )}
          </div>
        )}
      </Card>
    </Container>
  );
}
