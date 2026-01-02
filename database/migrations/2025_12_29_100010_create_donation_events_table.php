<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('donation_events', function (Blueprint $table): void {
      $table->id();
      $table->foreignId('donation_id')->constrained('donations')->cascadeOnDelete();
      $table->enum('type', ['created', 'paid', 'tts_ready', 'broadcasted', 'played', 'refunded']);
      $table->json('payload_json')->nullable();
      $table->timestamp('created_at')->useCurrent();

      $table->index(['donation_id', 'created_at']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('donation_events');
  }
};
