<?php

return [
  'default_provider_code' => env('PAYMENTS_DEFAULT_PROVIDER', 'mockpay'),

  'mock' => [
    'webhook_secret' => env('MOCKPAY_WEBHOOK_SECRET'),
  ],
];
