import React from 'react';
import { Card, Stack } from 'react-bootstrap';

const payments = [
  { provider: 'Stripe', amount: '$10', status: 'succeeded', createdAt: '10.09' },
  { provider: 'PayPal', amount: '$5', status: 'refunded', createdAt: '07.09' },
];

export default function DonorHistoryPage() {
  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">История платежей</h1>
        <p className="section-subtitle">Реестр транзакций донатора и статусы возвратов.</p>
      </div>
      <Stack gap={3}>
        {payments.map((payment) => (
          <Card key={payment.provider + payment.createdAt} className="shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <Card.Title className="mb-1 fs-6">{payment.provider}</Card.Title>
                <Card.Text className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  {payment.createdAt}
                </Card.Text>
              </div>
              <div className="text-end">
                <div className="fw-semibold">{payment.amount}</div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {payment.status}
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}