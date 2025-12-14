import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Stack } from 'react-bootstrap';

const initialForm = {
  title: '',
  durationSec: '',
  tagIds: [],
};

export default function DonorSuggestMemePage() {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      setFetching(true);
      setError('');
      try {
        const tagsResponse = await axios.get('/api/v1/tags', { params: { type: 'meme' } });
        setTags(tagsResponse?.data?.data ?? []);
      } catch (err) {
        setError(err.response?.data?.message || 'Не удалось загрузить список тегов.');
      } finally {
        setFetching(false);
      }
    }

    load();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!file) {
      setError('Загрузите файл мем-клипа.');
      setLoading(false);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append('type', 'meme_video');
      uploadData.append('file', file);

      const uploadResponse = await axios.post('/api/v1/media-files', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileId = uploadResponse?.data?.data?.id;

      await axios.post('/api/v1/meme-clips', {
        title: form.title,
        duration_sec: Number(form.durationSec),
        file_id: fileId,
        tag_ids: form.tagIds,
      });

      setSuccess('Мем отправлен на модерацию! Мы сообщим, когда он станет доступен.');
      setForm(initialForm);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось отправить мем.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">Предложить мем</h1>
        <p className="section-subtitle mb-0">
          Загрузите свой мем-клип для донатов. После проверки модератором он появится в галерее.
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="py-2">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="py-2">
          {success}
        </Alert>
      )}

      {fetching ? (
        <Card className="shadow-sm">
          <Card.Body className="d-flex align-items-center gap-2 text-muted">
            <Spinner animation="border" size="sm" /> Загрузка данных…
          </Card.Body>
        </Card>
      ) : (
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Card className="shadow-sm">
            <Card.Body className="d-flex flex-column gap-3">
              <Row className="g-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Название</Form.Label>
                    <Form.Control
                      required
                      value={form.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Например: Танцующий котик"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Длительность (сек)</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      required
                      value={form.durationSec}
                      onChange={(e) => handleChange('durationSec', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group>
                <Form.Label className="fw-semibold">Файл мем-клипа</Form.Label>
                <Form.Control
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
                <Form.Text className="text-muted">До 50 МБ, поддерживаются видео форматы.</Form.Text>
                {file && (
                  <div className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    Выбран файл: <span className="fw-semibold text-dark">{file.name}</span>
                  </div>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label className="fw-semibold">Теги</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      bg={form.tagIds.includes(tag.id) ? 'primary' : 'light'}
                      text={form.tagIds.includes(tag.id) ? 'light' : 'dark'}
                      role="button"
                      className="border"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {tags.length === 0 && <span className="text-muted">Теги не настроены.</span>}
                </div>
                <Form.Text className="text-muted">Теги помогают стримерам фильтровать мемы.</Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button type="submit" disabled={loading} variant="primary">
                  {loading ? 'Отправляем…' : 'Отправить на модерацию'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Form>
      )}
    </Stack>
  );
}