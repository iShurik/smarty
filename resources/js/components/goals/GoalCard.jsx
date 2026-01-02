import React from 'react';
import { Badge, Card, ProgressBar } from 'react-bootstrap';

const formatAmount = (value, currency) => {
  const numeric = Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return `0 ${currency ?? ''}`.trim();
  }

  if (!currency) {
    return numeric.toFixed(2);
  }

  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(numeric);
  } catch (error) {
    return `${numeric.toFixed(2)} ${currency}`;
  }
};

const formatDateTime = (value) => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function GoalCard({ goal, actions = null, showStatus = false }) {
  const target = Number(goal?.target_amount ?? 0);
  const current = Number(goal?.current_amount ?? 0);
  const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const startLabel = formatDateTime(goal?.starts_at);
  const endLabel = formatDateTime(goal?.ends_at);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body className="d-flex flex-column gap-3">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <Card.Title className="mb-1 fs-6">{goal?.title ?? 'Без названия'}</Card.Title>
            {goal?.description && <Card.Text className="text-muted mb-0">{goal.description}</Card.Text>}
          </div>
          <div className="d-flex align-items-center gap-2">
            {showStatus && (
              <Badge bg={goal?.is_active ? 'success' : 'secondary'}>
                {goal?.is_active ? 'Активна' : 'Скрыта'}
              </Badge>
            )}
            {actions}
          </div>
        </div>

        <div>
          <div className="d-flex align-items-center justify-content-between fw-semibold">
            <span>{formatAmount(current, goal?.currency)}</span>
            <span className="text-muted">из {formatAmount(target, goal?.currency)}</span>
          </div>
          <ProgressBar now={progress} className="mt-2" animated={progress > 0 && progress < 100} />
        </div>

        {(startLabel || endLabel) && (
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
            {startLabel && <span>Старт: {startLabel}</span>}
            {startLabel && endLabel && <span className="mx-2">•</span>}
            {endLabel && <span>Финиш: {endLabel}</span>}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
