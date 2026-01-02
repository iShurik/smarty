import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Stack } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import GoalCard from '../components/goals/GoalCard';

const emptyDonationForm = {
  donor_name: '',
  amount: '',
  message_text: '',
  goal_id: '',
  voice_id: '',
  youtube_url: '',
  meme_clip_id: '',
};

const extractData = (response) => response?.data?.data ?? response?.data ?? {};

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

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const normalizeOptional = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  return value;
};

export default function StreamerPublicPage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [voices, setVoices] = useState([]);
  const [memeClips, setMemeClips] = useState([]);
  const [allowedVoiceIds, setAllowedVoiceIds] = useState([]);
  const [bannedMemeTagIds, setBannedMemeTagIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({ ...emptyDonationForm });
  const [donation, setDonation] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    async function fetchStreamer() {
      setLoading(true);
      setPageError('');

      try {
        const [streamerResponse, voicesResponse, memesResponse] = await Promise.all([
          axios.get(`/api/v1/public/streamers/${slug}`),
          axios.get('/api/v1/tts/voices'),
          axios.get('/api/v1/meme-clips'),
        ]);
        const data = extractData(streamerResponse);
        setProfile(data);
        setGoals(data.goals ?? []);
        setAllowedVoiceIds(data.allowed_voice_ids ?? []);
        setBannedMemeTagIds(data.banned_meme_tag_ids ?? []);
        setVoices(extractData(voicesResponse));
        setMemeClips(extractData(memesResponse));
      } catch (err) {
        setPageError(err.response?.data?.message || 'Не удалось загрузить страницу стримера.');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      setForm({ ...emptyDonationForm });
      setDonation(null);
      setPayment(null);
      setFormErrors({});
      setSubmitError('');
      fetchStreamer();
    }
  }, [slug]);

  const availableVoices = useMemo(() => {
    if (!voices.length) {
      return [];
    }
    if (!allowedVoiceIds.length) {
      return voices;
    }
    const allowed = new Set(allowedVoiceIds.map((id) => String(id)));
    return voices.filter((voice) => allowed.has(String(voice.id)));
  }, [voices, allowedVoiceIds]);

  const availableMemes = useMemo(() => {
    if (!memeClips.length) {
      return [];
    }
    if (!bannedMemeTagIds.length) {
      return memeClips;
    }
    const banned = new Set(bannedMemeTagIds.map((id) => String(id)));
    return memeClips.filter((clip) =>
      (clip.tags ?? []).every((tag) => !banned.has(String(tag.id)))
    );
  }, [memeClips, bannedMemeTagIds]);

  const activeGoal = useMemo(() => {
    if (!form.goal_id) {
      return null;
    }

    return goals.find((goal) => String(goal.id) === String(form.goal_id));
  }, [form.goal_id, goals]);

  const selectedMeme = useMemo(() => {
    if (!form.meme_clip_id) {
      return null;
    }

    return availableMemes.find((clip) => String(clip.id) === String(form.meme_clip_id));
  }, [form.meme_clip_id, availableMemes]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setFormErrors({});

    try {
      const payload = {
        streamer_slug: slug,
        donor_name: normalizeOptional(form.donor_name),
        amount: form.amount,
        message_text: normalizeOptional(form.message_text),
        goal_id: normalizeOptional(form.goal_id) ? Number(form.goal_id) : null,
        voice_id: normalizeOptional(form.voice_id) ? Number(form.voice_id) : null,
        youtube_url: normalizeOptional(form.youtube_url),
        meme_clip_id: normalizeOptional(form.meme_clip_id) ? Number(form.meme_clip_id) : null,
      };

      const response = await axios.post('/api/v1/donations', payload);
      setDonation(response?.data?.data ?? null);
      setPayment(response?.data?.payment ?? null);
      setSubmitError('');
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors ?? {};
        setFormErrors(errors);
        if (errors.payment_provider) {
          setSubmitError(errors.payment_provider.join(', '));
        }
      } else {
        setSubmitError(err.response?.data?.message || 'Не удалось создать донат.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyDonationForm });
    setDonation(null);
    setPayment(null);
    setFormErrors({});
    setSubmitError('');
  };

  return (
    <Stack gap={4}>
      {loading ? (
        <Card className="shadow-sm">
          <Card.Body className="text-muted d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" /> Загрузка страницы…
          </Card.Body>
        </Card>
      ) : pageError ? (
        <Alert variant="danger" className="py-2">
          {pageError}
        </Alert>
      ) : (
        <>
          <div>
            <h1 className="section-title fs-3 mb-1">{profile?.display_name ?? 'Стример'}</h1>
            <p className="section-subtitle mb-2">
              {profile?.about || 'Публичная страница донатов с активными целями и быстрым выбором полоски сбора.'}
            </p>
            <div className="d-flex flex-wrap gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
              {profile?.country_code && <span>Страна: {profile.country_code}</span>}
              {profile?.min_amount !== null && profile?.min_amount !== undefined && (
                <span>Минимальный донат: {formatAmount(profile.min_amount, goals[0]?.currency ?? 'USD')}</span>
              )}
              {profile?.slug && (
                <Badge bg="light" text="dark">
                  @{profile.slug}
                </Badge>
              )}
            </div>
          </div>

          <Row className="g-4">
            <Col lg={5}>
              <Card className="shadow-sm">
                <Card.Body>
                  {submitError && (
                    <Alert variant="danger" className="py-2">
                      {submitError}
                    </Alert>
                  )}
                  {payment ? (
                    <Stack gap={3}>
                      <div>
                        <Card.Title className="fs-6">Оплата доната</Card.Title>
                        <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                          Платёж создан, осталось перейти на страницу провайдера и завершить оплату.
                        </Card.Text>
                      </div>

                      <Card className="border-0 bg-light">
                        <Card.Body className="py-2 d-flex flex-column gap-1">
                          <div className="text-uppercase text-muted" style={{ fontSize: '0.75rem' }}>
                            Сводка
                          </div>
                          <div className="fw-semibold">
                            {formatAmount(donation?.amount ?? form.amount, donation?.currency ?? goals[0]?.currency)}
                          </div>
                          {donation?.message_text && (
                            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                              Сообщение: {donation.message_text}
                            </div>
                          )}
                          {payment?.provider_code && (
                            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                              Провайдер: {payment.provider_code}
                            </div>
                          )}
                        </Card.Body>
                      </Card>

                      {donation?.country_warning && (
                        <Alert variant="warning" className="py-2">
                          YouTube ролик может быть недоступен в стране стримера. Донат всё равно принят.
                        </Alert>
                      )}

                      {payment?.redirect_url ? (
                        <Button as="a" href={payment.redirect_url} target="_blank" rel="noreferrer" variant="primary">
                          Перейти к оплате
                        </Button>
                      ) : (
                        <Alert variant="warning" className="py-2">
                          Провайдер не вернул ссылку для оплаты.
                        </Alert>
                      )}

                      <Button variant="outline-secondary" onClick={resetForm}>
                        Создать новый донат
                      </Button>
                    </Stack>
                  ) : (
                    <>
                      <Card.Title className="fs-6">Отправить донат</Card.Title>
                      <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Заполните данные доната, выберите цель, голос, YouTube ролик или мем. После подтверждения
                        откроется экран оплаты.
                      </Card.Text>

                      <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                        <Form.Group controlId="donorName">
                          <Form.Label>Ваше имя</Form.Label>
                          <Form.Control
                            type="text"
                            name="donor_name"
                            value={form.donor_name}
                            onChange={handleChange}
                            placeholder="Например, NeonFox"
                            isInvalid={Boolean(formErrors.donor_name)}
                          />
                          {formErrors.donor_name && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.donor_name.join(', ')}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group controlId="donationAmount">
                          <Form.Label>Сумма доната</Form.Label>
                          <Form.Control
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            min={profile?.min_amount ?? 0}
                            step="0.01"
                            placeholder="25.00"
                            isInvalid={Boolean(formErrors.amount)}
                            required
                          />
                          {formErrors.amount && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.amount.join(', ')}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group controlId="donationMessage">
                          <Form.Label>Сообщение</Form.Label>
                          <Form.Control
                            as="textarea"
                            name="message_text"
                            rows={3}
                            value={form.message_text}
                            onChange={handleChange}
                            placeholder="Поддерживаю стрим!"
                            isInvalid={Boolean(formErrors.message_text)}
                          />
                          {formErrors.message_text && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.message_text.join(', ')}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group controlId="donationGoal">
                          <Form.Label>Цель сбора</Form.Label>
                          <Form.Select
                            name="goal_id"
                            value={form.goal_id}
                            onChange={handleChange}
                            isInvalid={Boolean(formErrors.goal_id)}
                          >
                            <option value="">Без цели</option>
                            {goals.map((goal) => (
                              <option key={goal.id} value={goal.id}>
                                {goal.title}
                              </option>
                            ))}
                          </Form.Select>
                          {formErrors.goal_id && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.goal_id.join(', ')}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        {activeGoal && (
                          <Card className="border-0 bg-light">
                            <Card.Body className="py-2">
                              <div className="text-uppercase text-muted" style={{ fontSize: '0.75rem' }}>
                                Выбранная цель
                              </div>
                              <div className="fw-semibold">{activeGoal.title}</div>
                              <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                                {formatAmount(activeGoal.current_amount, activeGoal.currency)} из{' '}
                                {formatAmount(activeGoal.target_amount, activeGoal.currency)}
                              </div>
                            </Card.Body>
                          </Card>
                        )}

                        <Form.Group controlId="donationVoice">
                          <Form.Label>Голос TTS</Form.Label>
                          <Form.Select
                            name="voice_id"
                            value={form.voice_id}
                            onChange={handleChange}
                            isInvalid={Boolean(formErrors.voice_id)}
                            disabled={availableVoices.length === 0}
                          >
                            <option value="">Без озвучки</option>
                            {availableVoices.map((voice) => (
                              <option key={voice.id} value={voice.id}>
                                {voice.name} · {voice.provider}
                                {voice.lang ? ` (${voice.lang})` : ''}
                              </option>
                            ))}
                          </Form.Select>
                          {availableVoices.length === 0 && (
                            <Form.Text className="text-muted">Стример ещё не настроил доступные голоса.</Form.Text>
                          )}
                          {formErrors.voice_id && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.voice_id.join(', ')}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group controlId="donationYoutube">
                          <Form.Label>YouTube ссылка</Form.Label>
                          <Form.Control
                            type="text"
                            name="youtube_url"
                            value={form.youtube_url}
                            onChange={handleChange}
                            placeholder="https://youtu.be/..."
                            isInvalid={Boolean(formErrors.youtube_url)}
                          />
                          {formErrors.youtube_url && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.youtube_url.join(', ')}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Form.Group controlId="donationMeme">
                          <Form.Label>Мем-клип</Form.Label>
                          <Form.Select
                            name="meme_clip_id"
                            value={form.meme_clip_id}
                            onChange={handleChange}
                            isInvalid={Boolean(formErrors.meme_clip_id)}
                            disabled={availableMemes.length === 0}
                          >
                            <option value="">Без мема</option>
                            {availableMemes.map((clip) => (
                              <option key={clip.id} value={clip.id}>
                                {clip.title} · {formatDuration(clip.duration_sec)}
                              </option>
                            ))}
                          </Form.Select>
                          {availableMemes.length === 0 && (
                            <Form.Text className="text-muted">Нет доступных мем-клипов.</Form.Text>
                          )}
                          {formErrors.meme_clip_id && (
                            <Form.Control.Feedback type="invalid">
                              {formErrors.meme_clip_id.join(', ')}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>

                        {selectedMeme && (
                          <Card className="border-0 bg-light">
                            <Card.Body className="py-2 d-flex flex-column gap-2">
                              <div className="d-flex justify-content-between align-items-start gap-2">
                                <div>
                                  <div className="text-uppercase text-muted" style={{ fontSize: '0.75rem' }}>
                                    Выбранный мем
                                  </div>
                                  <div className="fw-semibold">{selectedMeme.title}</div>
                                </div>
                                <Badge bg="light" text="dark" className="border">
                                  {formatDuration(selectedMeme.duration_sec)}
                                </Badge>
                              </div>
                              {selectedMeme.file?.path && (
                                <video
                                  style={{ width: '100%', borderRadius: '0.5rem' }}
                                  src={`/storage/${selectedMeme.file.path}`}
                                  controls
                                />
                              )}
                              <div className="d-flex flex-wrap gap-1">
                                {(selectedMeme.tags ?? []).map((tag) => (
                                  <Badge key={tag.id} bg="primary" className="bg-opacity-10 text-primary">
                                    {tag.name}
                                  </Badge>
                                ))}
                                {(selectedMeme.tags ?? []).length === 0 && (
                                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    Без тегов
                                  </span>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        )}

                        <Button type="submit" variant="primary" disabled={submitting}>
                          {submitting ? 'Создаём донат…' : 'Перейти к оплате'}
                        </Button>
                      </Form>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Stack gap={3}>
                <div>
                  <h2 className="section-title fs-5 mb-1">Цели стримера</h2>
                  <p className="section-subtitle" style={{ fontSize: '0.95rem' }}>
                    Актуальные полоски сбора. Кликните по цели, чтобы выбрать её для доната.
                  </p>
                </div>

                {goals.length === 0 ? (
                  <Card className="shadow-sm">
                    <Card.Body className="text-muted">Активных целей пока нет.</Card.Body>
                  </Card>
                ) : (
                  <Row className="g-3">
                    {goals.map((goal) => (
                      <Col md={6} key={goal.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setForm((prev) => ({ ...prev, goal_id: String(goal.id) }))}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              setForm((prev) => ({ ...prev, goal_id: String(goal.id) }));
                            }
                          }}
                        >
                          <GoalCard
                            goal={goal}
                            actions={
                              form.goal_id && String(form.goal_id) === String(goal.id) ? (
                                <Badge bg="primary">Выбрано</Badge>
                              ) : null
                            }
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Stack>
            </Col>
          </Row>
        </>
      )}
    </Stack>
  );
}
