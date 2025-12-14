import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, InputGroup, Row, Spinner, Stack } from 'react-bootstrap';

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function MemeGalleryPage() {
  const [memes, setMemes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function fetchMemes() {
      setLoading(true);
      setError('');
      try {
        const [memesResponse, tagsResponse] = await Promise.all([
          axios.get('/api/v1/meme-clips'),
          axios.get('/api/v1/tags', { params: { type: 'meme' } }),
        ]);
        setMemes(memesResponse?.data?.data ?? []);
        setTags(tagsResponse?.data?.data ?? []);
      } catch (err) {
        setError(err.response?.data?.message || 'Не удалось загрузить мемы.');
      } finally {
        setLoading(false);
      }
    }

    fetchMemes();
  }, []);

  const filteredMemes = useMemo(() => {
    return memes.filter((clip) => {
      const matchesSearch = clip.title.toLowerCase().includes(search.toLowerCase());
      const matchesTags =
        selectedTagIds.length === 0 || clip.tags.some((tag) => selectedTagIds.includes(tag.id));
      return matchesSearch && matchesTags;
    });
  }, [memes, search, selectedTagIds]);

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCopy = async (clipId) => {
    try {
      await navigator.clipboard.writeText(String(clipId));
      setCopiedId(clipId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      setError('Не удалось скопировать ID клипа.');
    }
  };

  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">Галерея мемов</h1>
        <p className="section-subtitle mb-0">
          Выберите мем-клип для доната: смотрите превью, фильтруйте по тегам и копируйте ID.
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="py-2">
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={6} lg={5}>
              <Form.Label className="fw-semibold">Поиск</Form.Label>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Название или описание"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={7}>
              <Form.Label className="fw-semibold">Теги</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Form.Check
                    key={tag.id}
                    id={`tag-${tag.id}`}
                    type="switch"
                    label={tag.name}
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                ))}
                {tags.length === 0 && <span className="text-muted">Нет тегов</span>}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Card className="shadow-sm">
          <Card.Body className="d-flex align-items-center gap-2 text-muted">
            <Spinner animation="border" size="sm" /> Загрузка мемов…
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {filteredMemes.map((clip) => (
            <Col md={6} lg={4} key={clip.id}>
              <Card className="shadow-sm h-100">
                {clip.file?.path && (
                  <video
                    className="card-img-top"
                    style={{ maxHeight: 220, objectFit: 'cover' }}
                    src={`/storage/${clip.file.path}`}
                    controls
                  />
                )}
                <Card.Body className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <Card.Title className="fs-6 mb-0">{clip.title}</Card.Title>
                    <Badge bg="light" text="dark" className="border">
                      {formatDuration(clip.duration_sec)}
                    </Badge>
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {clip.tags.map((tag) => (
                      <Badge key={tag.id} bg="primary" className="bg-opacity-10 text-primary">
                        {tag.name}
                      </Badge>
                    ))}
                    {clip.tags.length === 0 && (
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Без тегов
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                      ID: <span className="fw-semibold text-dark">{clip.id}</span>
                    </div>
                    <Button
                      variant={copiedId === clip.id ? 'success' : 'outline-primary'}
                      size="sm"
                      onClick={() => handleCopy(clip.id)}
                    >
                      {copiedId === clip.id ? 'ID скопирован' : 'Скопировать ID'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}

          {filteredMemes.length === 0 && !loading && (
            <Col>
              <Card className="shadow-sm">
                <Card.Body className="text-center text-muted">Мемы не найдены по заданным фильтрам.</Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </Stack>
  );
}