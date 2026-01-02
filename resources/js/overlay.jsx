import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/overlay.css';

const overlayConfig = window.__OVERLAY__ || {};
const overlaySlug = overlayConfig.slug || '';
const overlayToken = overlayConfig.token || '';

const phaseLabels = {
  idle: 'Ожидание',
  show: 'Показ доната',
  tts: 'TTS',
  youtube: 'YouTube',
  meme: 'Мем',
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildYoutubeEmbedUrl = (youtubeId) =>
  `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=0&rel=0&playsinline=1`;

const extractYoutubeId = (url) => {
  if (!url) {
    return null;
  }
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
};

const formatAmount = (amount, currency) => `${amount} ${currency || ''}`.trim();

function OverlayApp() {
  const [queue, setQueue] = useState([]);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [connectionState, setConnectionState] = useState(
    overlaySlug && overlayToken ? 'connecting' : 'missing',
  );
  const [youtubeUrl, setYoutubeUrl] = useState(null);
  const [videoVisible, setVideoVisible] = useState(false);
  const videoRef = useRef(null);
  const isPlayingRef = useRef(false);

  const connectionLabel = useMemo(() => {
    if (connectionState === 'missing') {
      return 'Нет токена';
    }
    if (connectionState === 'connecting') {
      return 'Подключение';
    }
    if (connectionState === 'reconnecting') {
      return 'Повтор';
    }
    return 'В эфире';
  }, [connectionState]);

  useEffect(() => {
    if (!overlaySlug || !overlayToken) {
      return;
    }

    const source = new EventSource(
      `/overlay/streamer/${overlaySlug}?token=${encodeURIComponent(overlayToken)}`,
    );

    const handleDonation = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setQueue((prev) => [...prev, payload]);
      } catch (error) {
        // ignore malformed payloads
      }
    };

    const handleOpen = () => setConnectionState('live');
    const handleError = () => setConnectionState('reconnecting');

    source.addEventListener('donation', handleDonation);
    source.addEventListener('open', handleOpen);
    source.addEventListener('error', handleError);

    return () => {
      source.removeEventListener('donation', handleDonation);
      source.removeEventListener('open', handleOpen);
      source.removeEventListener('error', handleError);
      source.close();
    };
  }, []);

  useEffect(() => {
    if (isPlayingRef.current || queue.length === 0) {
      return;
    }

    const next = queue[0];
    setQueue((prev) => prev.slice(1));
    isPlayingRef.current = true;
    setCurrentDonation(next);

    const runSequence = async () => {
      setPhase('show');
      await wait(900);

      if (next.tts_audio_url) {
        setPhase('tts');
        await playAudio(next.tts_audio_url);
      }

      if (next.youtube_id || next.youtube_url) {
        setPhase('youtube');
        await playYoutube(next);
      }

      if (next.meme_clip_url) {
        setPhase('meme');
        await playVideo(next.meme_clip_url);
      }
    };

    runSequence()
      .catch(() => {})
      .finally(() => {
        setYoutubeUrl(null);
        setVideoVisible(false);
        setPhase('idle');
        setCurrentDonation(null);
        isPlayingRef.current = false;
        acknowledgeDonation(next).catch(() => {});
      });
  }, [queue]);

  const playAudio = (url) =>
    new Promise((resolve) => {
      const audio = new Audio(url);
      const cleanup = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleEnded);
      };
      const handleEnded = () => {
        cleanup();
        resolve();
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleEnded);
      audio.play().catch(() => resolve());
    });

  const playYoutube = async (donation) => {
    const youtubeId = donation.youtube_id || extractYoutubeId(donation.youtube_url);
    if (!youtubeId) {
      return;
    }

    const duration = Number(donation.youtube_duration_sec || 18);
    setYoutubeUrl(buildYoutubeEmbedUrl(youtubeId));
    await wait(Math.max(duration, 6) * 1000);
    setYoutubeUrl(null);
  };

  const playVideo = (url) =>
    new Promise((resolve) => {
      const video = videoRef.current;
      if (!video) {
        resolve();
        return;
      }

      const cleanup = () => {
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('error', handleEnded);
      };

      const handleEnded = () => {
        cleanup();
        resolve();
      };

      video.addEventListener('ended', handleEnded);
      video.addEventListener('error', handleEnded);
      video.src = url;
      video.load();
      setVideoVisible(true);

      video.play().catch(() => {
        cleanup();
        resolve();
      });
    });

  const acknowledgeDonation = async (donation) => {
    if (!donation?.donation_id || !overlaySlug || !overlayToken) {
      return;
    }

    await fetch(`/api/v1/overlay/streamer/${overlaySlug}/ack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Overlay-Token': overlayToken,
      },
      body: JSON.stringify({ donation_id: donation.donation_id }),
    });
  };

  return (
    <div className="overlay-shell">
      {currentDonation ? (
        <div className="overlay-card">
          <div className="overlay-title">Новый донат</div>
          <div className="donation-row">
            <div className="donor-name">{currentDonation.donor_name}</div>
            <div className="donation-amount">
              {formatAmount(currentDonation.amount, currentDonation.currency)}
            </div>
          </div>
          <div className="donation-message">{currentDonation.text || 'Без сообщения.'}</div>
          <div className="phase-pill">{phaseLabels[phase]}</div>
        </div>
      ) : (
        <div className="overlay-empty">Ждём донаты для воспроизведения.</div>
      )}

      <div className="media-stage">
        <div
          className={`media-frame ${
            youtubeUrl || videoVisible ? 'media-visible' : 'media-hidden'
          }`}
        >
          {youtubeUrl ? (
            <iframe
              title="YouTube"
              src={youtubeUrl}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <video ref={videoRef} playsInline />
          )}
        </div>
      </div>

      <div className={`connection-badge ${connectionState === 'live' ? 'is-live' : ''}`}>
        {connectionLabel}
      </div>
    </div>
  );
}

const rootElement = document.getElementById('overlay-root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <OverlayApp />
    </React.StrictMode>,
  );
}
