import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const mediaSections = [
  {
    title: 'TTS голоса',
    description: 'Каталог голосов и разрешённые варианты для стримера.',
    items: ['Google: ru-RU WaveNet', 'AWS: Joanna', 'ElevenLabs: Viral RU'],
  },
  {
    title: 'YouTube ссылки',
    description: 'Кеш метаданных, лимит 1000 просмотров, региональные ограничения.',
    items: ['Последняя проверка: 5 мин назад', 'Заблокировано: 3 ссылки'],
  },
  {
    title: 'Мем-клипы',
    description: 'Модерация предложенных донаторами клипов и управление тегами.',
    items: ['В очереди: 4', 'Одобрено: 12', 'Отклонено: 2'],
  },
];

export default function StreamerMediaPage() {
  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <h1 className="section-title fs-4 mb-1">Медиа и правила</h1>
        <p className="section-subtitle">Единая точка настройки голосов, YouTube фильтров и мемов.</p>
      </div>
      <Row className="g-3">
        {mediaSections.map((section) => (
          <Col md={4} key={section.title}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="text-uppercase text-primary fw-semibold" style={{ fontSize: '0.8rem' }}>
                  {section.title}
                </div>
                <Card.Text className="section-subtitle">{section.description}</Card.Text>
                <ul className="mb-0 ps-3">
                  {section.items.map((item) => (
                    <li key={item} className="section-subtitle">
                      {item}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}