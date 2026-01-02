<?php

namespace Database\Seeders;

use App\Models\PaymentProvider;
use Illuminate\Database\Seeder;

class PaymentProviderSeeder extends Seeder
{
  public function run(): void
  {
    PaymentProvider::updateOrCreate(
      ['code' => 'mockpay'],
      [
        'title' => 'MockPay',
        'is_active' => true,
      ]
    );
  }
}
