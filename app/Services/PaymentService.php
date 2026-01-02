<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\DonationEvent;
use App\Models\Payment;
use App\Models\PaymentProvider;
use Illuminate\Support\Facades\DB;
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

      if (! $donation || $donation->status === Donation::STATUS_PAID) {
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
        'payload_json' => null,
        'created_at' => now(),
      ]);
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
}
