import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Stack } from 'react-bootstrap';

const statusLabels = {
  submitted: 'На модерации',
  approved: 'Одобрено',
  rejected: 'Отклонено',
};

export default function AdminMemeModerationPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentById, setCommentById] = useState({});
  const [actioningId, setActioningId] = useState(null);

  const loadQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/v1/meme-clips', { params: { status: 'submitted' } });
      setQueue(response?.data?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось загрузить очередь мемов.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleDecision = async (clipId, action) => {
    setActioningId(clipId);
    setError('');
    try {
      await axios.post(`/api/v1/moderation/meme-clips/${clipId}/${action}`, {
        moderation_comment: commentById[clipId] || null,
      });
      setQueue((prev) => prev.filter((clip) => clip.id !== clipId));
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось применить решение.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">Модерация мемов</h1>
        <p className="section-subtitle mb-0">
          Проверяйте предложенные клипы донаторов и принимайте решения перед публикацией в галерее.
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="py-2">
          {error}
        </Alert>
      )}

      {loading ? (
        <Card className="shadow-sm">
          <Card.Body className="d-flex align-items-center gap-2 text-muted">
            <Spinner animation="border" size="sm" /> Загрузка очереди…
          </Card.Body>
        </Card>
      ) : queue.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center text-muted">Новых мемов в очереди нет.</Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {queue.map((clip) => (
            <Col md={6} key={clip.id}>
              <Card className="shadow-sm h-100">
                {clip.file?.path && (
                  <video
                    className="card-img-top"
                    style={{ maxHeight: 220, objectFit: 'cover' }}
                    src={`/storage/${clip.file.path}`}
                    controls
                  />
                )}
                <Card.Body className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <Card.Title className="fs-6 mb-1">{clip.title}</Card.Title>
                      <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                        От {clip.suggested_by?.name ?? 'гостя'}
                      </div>
                    </div>
                    <Badge bg="warning" text="dark" className="text-uppercase" style={{ fontSize: '0.8rem' }}>
                      {statusLabels[clip.status]}
                    </Badge>
                  </div>

                  <div className="d-flex flex-wrap gap-1">
                    {clip.tags.map((tag) => (
                      <Badge key={tag.id} bg="secondary" className="bg-opacity-10 text-secondary">
                        {tag.name}
                      </Badge>
                    ))}
                    {clip.tags.length === 0 && <span className="text-muted">Без тегов</span>}
                  </div>

                  <Form.Group>
                    <Form.Label className="fw-semibold">Комментарий</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Причина или пометка модерации"
                      value={commentById[clip.id] ?? ''}
                      onChange={(e) =>
                        setCommentById((prev) => ({
                          ...prev,
                          [clip.id]: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      disabled={actioningId === clip.id}
                      onClick={() => handleDecision(clip.id, 'reject')}
                    >
                      {actioningId === clip.id ? 'Отклоняем…' : 'Отклонить'}
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      disabled={actioningId === clip.id}
                      onClick={() => handleDecision(clip.id, 'approve')}
                    >
                      {actioningId === clip.id ? 'Одобряем…' : 'Одобрить'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Stack>
  );
}