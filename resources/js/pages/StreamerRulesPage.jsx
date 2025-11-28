import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, ListGroup, Row, Spinner, Stack } from 'react-bootstrap';

const youtubeIdRegex = /^[A-Za-z0-9_-]{3,32}$/;

const extractData = (response) => response?.data?.data ?? response?.data ?? response ?? {};

export default function StreamerRulesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [voices, setVoices] = useState([]);
  const [memeTags, setMemeTags] = useState([]);

  const [allowedVoiceIds, setAllowedVoiceIds] = useState([]);
  const [bannedMemeTagIds, setBannedMemeTagIds] = useState([]);
  const [bannedYoutubeEntries, setBannedYoutubeEntries] = useState([]);

  const [saving, setSaving] = useState({ voices: false, memeTags: false, youtube: false });
  const [messages, setMessages] = useState({ voices: '', memeTags: '', youtube: '' });
  const [sectionErrors, setSectionErrors] = useState({ voices: '', memeTags: '', youtube: '' });

  const [youtubeIdInput, setYoutubeIdInput] = useState('');
  const [youtubeValidation, setYoutubeValidation] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      setMessages({ voices: '', memeTags: '', youtube: '' });
      setSectionErrors({ voices: '', memeTags: '', youtube: '' });

      try {
        const [rulesResponse, voicesResponse, memeTagsResponse] = await Promise.all([
          axios.get('/api/v1/streamer/rules'),
          axios.get('/api/v1/tts/voices'),
          axios.get('/api/v1/tags', { params: { type: 'meme' } }),
        ]);

        const rules = extractData(rulesResponse);
        setVoices(extractData(voicesResponse));
        setMemeTags(extractData(memeTagsResponse));
        syncRulesState(rules);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Не удалось загрузить правила. Проверьте, что вы авторизованы как стример.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const syncRulesState = (rules) => {
    setAllowedVoiceIds((rules?.allowed_voices ?? []).map((voice) => voice.id));
    setBannedMemeTagIds((rules?.banned_meme_tags ?? []).map((tag) => tag.id));
    setBannedYoutubeEntries(rules?.banned_youtube_videos ?? []);
  };

  const voiceOptionsByProvider = useMemo(() => {
    return voices.reduce((acc, voice) => {
      if (!acc[voice.provider]) {
        acc[voice.provider] = [];
      }
      acc[voice.provider].push(voice);
      return acc;
    }, {});
  }, [voices]);

  const toggleVoice = (voiceId) => {
    setAllowedVoiceIds((prev) =>
      prev.includes(voiceId) ? prev.filter((id) => id !== voiceId) : [...prev, voiceId]
    );
  };

  const toggleTag = (tagId) => {
    setBannedMemeTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const addYoutubeId = () => {
    const trimmed = youtubeIdInput.trim();
    setYoutubeValidation('');

    if (!trimmed) {
      setYoutubeValidation('Введите YouTube ID.');
      return;
    }

    if (!youtubeIdRegex.test(trimmed)) {
      setYoutubeValidation('ID должен содержать 3-32 символа: латиница, цифры, "-" или "_".');
      return;
    }

    setBannedYoutubeEntries((prev) => {
      if (prev.some((entry) => entry.youtube_id === trimmed)) {
        return prev;
      }

      return [...prev, { youtube_id: trimmed }];
    });
    setYoutubeIdInput('');
  };

  const removeYoutubeId = (youtubeId) => {
    setBannedYoutubeEntries((prev) => prev.filter((entry) => entry.youtube_id !== youtubeId));
  };

  const handleSave = async (section) => {
    setSaving((prev) => ({ ...prev, [section]: true }));
    setMessages((prev) => ({ ...prev, [section]: '' }));
    setSectionErrors((prev) => ({ ...prev, [section]: '' }));

    try {
      let response;

      if (section === 'voices') {
        response = await axios.put('/api/v1/streamer/rules/allowed-voices', {
          voice_ids: allowedVoiceIds,
        });
      }

      if (section === 'memeTags') {
        response = await axios.put('/api/v1/streamer/rules/banned-meme-tags', {
          tag_ids: bannedMemeTagIds,
        });
      }

      if (section === 'youtube') {
        response = await axios.put('/api/v1/streamer/rules/banned-youtube-videos', {
          youtube_ids: bannedYoutubeEntries.map((entry) => entry.youtube_id),
        });
      }

      const rules = extractData(response);
      syncRulesState(rules);
      setMessages((prev) => ({ ...prev, [section]: 'Сохранено.' }));
    } catch (err) {
      setSectionErrors((prev) => ({
        ...prev,
        [section]: err.response?.data?.message || 'Не удалось сохранить изменения.',
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [section]: false }));
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <h1 className="section-title fs-4 mb-1">Правила стримера</h1>
        <p className="section-subtitle">
          Управляйте списком разрешённых TTS-голосов, банлистами мем-тегов и YouTube роликов. Настройки
          применяются при создании доната, TTS и проигрывании медиа на оверлее.
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
            <Spinner animation="border" size="sm" /> Загрузка правил…
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          <Col lg={4} md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body className="d-flex flex-column gap-3">
                <div>
                  <div className="text-uppercase text-primary fw-semibold" style={{ fontSize: '0.85rem' }}>
                    TTS голоса
                  </div>
                  <Card.Text className="section-subtitle mb-1">
                    Доступные провайдеры и голоса. В донате можно будет выбрать только разрешённые.
                  </Card.Text>
                </div>

                <div className="d-flex flex-column gap-3" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {Object.entries(voiceOptionsByProvider).map(([provider, providerVoices]) => (
                    <div key={provider} className="border rounded p-2">
                      <div className="fw-semibold mb-1 text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>
                        {provider}
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {providerVoices.map((voice) => (
                          <Form.Check
                            key={voice.id}
                            type="checkbox"
                            id={`voice-${voice.id}`}
                            label={`${voice.name} (${voice.lang}${voice.gender ? `, ${voice.gender}` : ''})`}
                            checked={allowedVoiceIds.includes(voice.id)}
                            onChange={() => toggleVoice(voice.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {sectionErrors.voices && (
                  <Alert variant="danger" className="py-2">
                    {sectionErrors.voices}
                  </Alert>
                )}
                {messages.voices && (
                  <Alert variant="success" className="py-2">
                    {messages.voices}
                  </Alert>
                )}

                <div className="d-flex gap-2">
                  <Button onClick={() => handleSave('voices')} disabled={saving.voices} variant="primary">
                    {saving.voices ? 'Сохранение…' : 'Сохранить голоса'}
                  </Button>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Отметьте минимум один голос, чтобы донатеры могли выбирать TTS.
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body className="d-flex flex-column gap-3">
                <div>
                  <div className="text-uppercase text-primary fw-semibold" style={{ fontSize: '0.85rem' }}>
                    Банлист мем-тегов
                  </div>
                  <Card.Text className="section-subtitle mb-1">
                    Теги, которые запрещено использовать в мем-клипах. Не проходят ни в донат, ни в предложениях.
                  </Card.Text>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {memeTags.length === 0 && (
                    <span className="text-muted">Каталог тегов пустой.</span>
                  )}
                  {memeTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      bg={bannedMemeTagIds.includes(tag.id) ? 'danger' : 'secondary'}
                      pill
                      className="d-inline-flex align-items-center gap-1"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleTag(tag.id)}
                    >
                      <span>{tag.name}</span>
                      <span style={{ fontSize: '0.8rem' }}>
                        {bannedMemeTagIds.includes(tag.id) ? '×' : '+'}
                      </span>
                    </Badge>
                  ))}
                </div>

                {sectionErrors.memeTags && (
                  <Alert variant="danger" className="py-2">
                    {sectionErrors.memeTags}
                  </Alert>
                )}
                {messages.memeTags && (
                  <Alert variant="success" className="py-2">
                    {messages.memeTags}
                  </Alert>
                )}

                <div className="d-flex gap-2">
                  <Button onClick={() => handleSave('memeTags')} disabled={saving.memeTags} variant="primary">
                    {saving.memeTags ? 'Сохранение…' : 'Сохранить банлист'}
                  </Button>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Оставьте пустым, если хотите принимать любые мемы.
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm h-100">
              <Card.Body className="d-flex flex-column gap-3">
                <div>
                  <div className="text-uppercase text-primary fw-semibold" style={{ fontSize: '0.85rem' }}>
                    YouTube банлист
                  </div>
                  <Card.Text className="section-subtitle mb-1">
                    Список YouTube роликов, которые нельзя отправлять в донат. Проверяется по youtube_id.
                  </Card.Text>
                </div>

                <Stack direction="horizontal" gap={2}>
                  <Form.Control
                    type="text"
                    placeholder="Например: dQw4w9WgXcQ"
                    value={youtubeIdInput}
                    onChange={(event) => setYoutubeIdInput(event.target.value)}
                    maxLength={32}
                  />
                  <Button variant="outline-primary" onClick={addYoutubeId}>
                    Добавить
                  </Button>
                </Stack>
                {youtubeValidation && (
                  <div className="text-danger" style={{ fontSize: '0.9rem' }}>
                    {youtubeValidation}
                  </div>
                )}

                <ListGroup className="flex-grow-1">
                  {bannedYoutubeEntries.length === 0 ? (
                    <ListGroup.Item className="text-muted">Список пуст.</ListGroup.Item>
                  ) : (
                    bannedYoutubeEntries.map((entry) => (
                      <ListGroup.Item
                        key={entry.youtube_id}
                        className="d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <div className="fw-semibold">{entry.youtube_id}</div>
                          {entry.reason && (
                            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                              Причина: {entry.reason}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removeYoutubeId(entry.youtube_id)}
                        >
                          Удалить
                        </Button>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>

                {sectionErrors.youtube && (
                  <Alert variant="danger" className="py-2">
                    {sectionErrors.youtube}
                  </Alert>
                )}
                {messages.youtube && (
                  <Alert variant="success" className="py-2">
                    {messages.youtube}
                  </Alert>
                )}

                <div className="d-flex gap-2">
                  <Button onClick={() => handleSave('youtube')} disabled={saving.youtube} variant="primary">
                    {saving.youtube ? 'Сохранение…' : 'Сохранить YouTube банлист'}
                  </Button>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    ID можно найти в URL после `watch?v=`.
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}