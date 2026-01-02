<?php

namespace App\Services;

use App\Jobs\DonationBroadcastJob;
use App\Jobs\TtsGenerateJob;
use App\Models\Donation;
use App\Models\DonationEvent;
use App\Models\Payment;
use App\Models\PaymentProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class PaymentService
{
  public function createDonationPayment(Donation $donation): array
  {
    $provider = $this->resolveProvider();

    $payment = Payment::create([
      'donation_id' => $donation->id,
      'provider_id' => $provider->id,
      'provider_payment_id' => (string) Str::uuid(),
      'amount' => $donation->amount,
      'currency' => $donation->currency,
      'status' => Payment::STATUS_INITIATED,
      'fee_amount' => 0,
      'meta_json' => null,
    ]);

    Log::channel('payments')->info('Donation payment initiated.', [
      'payment_id' => $payment->id,
      'donation_id' => $donation->id,
      'provider_code' => $provider->code,
      'provider_payment_id' => $payment->provider_payment_id,
      'amount' => (float) $payment->amount,
      'currency' => $payment->currency,
      'status' => $payment->status,
    ]);

    return [
      'payment' => $payment,
      'redirect_url' => $this->buildRedirectUrl($provider, $payment),
    ];
  }

  public function markSucceeded(Payment $payment, array $payload = []): void
  {
    if ($payment->status === Payment::STATUS_SUCCEEDED) {
      return;
    }

    DB::transaction(function () use ($payment, $payload): void {
      $payment->refresh();

      if ($payment->status === Payment::STATUS_SUCCEEDED) {
        return;
      }

      $payment->status = Payment::STATUS_SUCCEEDED;

      if (! empty($payload)) {
        $payment->meta_json = array_merge($payment->meta_json ?? [], $payload);
      }

      $payment->save();

      $donation = $payment->donation;

      if (! $donation || $donation->status !== Donation::STATUS_PENDING_PAYMENT) {
        return;
      }

      $donation->status = Donation::STATUS_PAID;
      $donation->save();

      if ($donation->goal) {
        $donation->goal()->increment('current_amount', $donation->amount);
      }

      DonationEvent::create([
        'donation_id' => $donation->id,
        'type' => DonationEvent::TYPE_PAID,
        'payload_json' => [
          'payment_id' => $payment->id,
          'provider_code' => $payment->provider?->code,
          'provider_payment_id' => $payment->provider_payment_id,
          'amount' => (float) $payment->amount,
          'currency' => $payment->currency,
          'fee_amount' => (float) $payment->fee_amount,
        ],
        'created_at' => now(),
      ]);

      Log::channel('payments')->info('Donation payment succeeded.', [
        'payment_id' => $payment->id,
        'donation_id' => $donation->id,
        'provider_code' => $payment->provider?->code,
        'provider_payment_id' => $payment->provider_payment_id,
        'amount' => (float) $payment->amount,
        'currency' => $payment->currency,
        'status' => $payment->status,
      ]);

      if ($this->shouldGenerateTts($donation)) {
        TtsGenerateJob::dispatch($donation->id)->afterCommit();
      } else {
        DonationBroadcastJob::dispatch($donation->id)->afterCommit();
      }
    });
  }

  public function markFailed(Payment $payment, array $payload = []): void
  {
    if ($payment->status === Payment::STATUS_SUCCEEDED || $payment->status === Payment::STATUS_FAILED) {
      return;
    }

    $payment->status = Payment::STATUS_FAILED;

    if (! empty($payload)) {
      $payment->meta_json = array_merge($payment->meta_json ?? [], $payload);
    }

    $payment->save();

    Log::channel('payments')->warning('Donation payment failed.', [
      'payment_id' => $payment->id,
      'donation_id' => $payment->donation_id,
      'provider_code' => $payment->provider?->code,
      'provider_payment_id' => $payment->provider_payment_id,
      'amount' => (float) $payment->amount,
      'currency' => $payment->currency,
      'status' => $payment->status,
    ]);
  }

  private function resolveProvider(): PaymentProvider
  {
    $providerCode = (string) config('payments.default_provider_code', 'mockpay');

    $provider = PaymentProvider::query()
      ->where('code', $providerCode)
      ->where('is_active', true)
      ->first();

    if (! $provider) {
      throw new RuntimeException('Active payment provider is not configured.');
    }

    return $provider;
  }

  private function buildRedirectUrl(PaymentProvider $provider, Payment $payment): string
  {
    if ($provider->code === 'mockpay') {
      return route('payments.mock.checkout', ['payment' => $payment->id]);
    }

    return route('payments.mock.checkout', ['payment' => $payment->id]);
  }

  private function shouldGenerateTts(Donation $donation): bool
  {
    return $donation->voice_id !== null
      && $donation->tts_audio_file_id === null;
  }
}
