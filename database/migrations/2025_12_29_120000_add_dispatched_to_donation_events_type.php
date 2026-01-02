<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  public function up(): void
  {
    DB::statement("ALTER TABLE donation_events MODIFY type ENUM('created', 'paid', 'tts_ready', 'broadcasted', 'dispatched', 'played', 'refunded')");
  }

  public function down(): void
  {
    DB::statement("ALTER TABLE donation_events MODIFY type ENUM('created', 'paid', 'tts_ready', 'broadcasted', 'played', 'refunded')");
  }
};
