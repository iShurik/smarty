<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class PaymentWebhookController extends Controller
{
  public function handleMock(Request $request, PaymentService $paymentService): JsonResponse
  {
    $this->validateMockSignature($request);

    $payload = $request->json()->all();
    $providerPaymentId = (string) ($payload['provider_payment_id'] ?? '');
    $status = (string) ($payload['status'] ?? '');

    if ($providerPaymentId === '' || $status === '') {
      return response()->json([
        'message' => 'Invalid payload.',
      ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    $payment = Payment::query()
      ->where('provider_payment_id', $providerPaymentId)
      ->first();

    if (! $payment) {
      return response()->json([
        'message' => 'Payment not found.',
      ], Response::HTTP_NOT_FOUND);
    }

    if ($status === Payment::STATUS_SUCCEEDED) {
      $paymentService->markSucceeded($payment, ['mock_status' => $status]);
    } elseif ($status === Payment::STATUS_FAILED) {
      $paymentService->markFailed($payment, ['mock_status' => $status]);
    } else {
      return response()->json([
        'message' => 'Unsupported status.',
      ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    return response()->json([
      'data' => [
        'payment_id' => $payment->id,
        'status' => $payment->status,
      ],
    ]);
  }

  private function validateMockSignature(Request $request): void
  {
    $secret = (string) config('payments.mock.webhook_secret', '');

    if ($secret === '') {
      return;
    }

    $signature = (string) $request->header('X-Mockpay-Signature', '');
    $expected = hash_hmac('sha256', $request->getContent(), $secret);

    if (! hash_equals($expected, $signature)) {
      Log::warning('MockPay webhook signature mismatch.');
      abort(Response::HTTP_UNAUTHORIZED, 'Invalid signature.');
    }
  }
}
