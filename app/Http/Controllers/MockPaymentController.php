<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\JsonResponse;

class MockPaymentController extends Controller
{
  public function show(Payment $payment): JsonResponse
  {
    return response()->json([
      'data' => [
        'payment_id' => $payment->id,
        'provider_payment_id' => $payment->provider_payment_id,
        'status' => $payment->status,
        'amount' => $payment->amount,
        'currency' => $payment->currency,
        'message' => 'MockPay checkout. Use webhook to mark payment succeeded.',
      ],
    ]);
  }
}
