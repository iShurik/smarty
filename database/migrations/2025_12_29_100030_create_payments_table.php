<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('payments', function (Blueprint $table): void {
      $table->id();
      $table->foreignId('donation_id')->nullable()->constrained('donations')->nullOnDelete();
      $table->foreignId('provider_id')->constrained('payment_providers')->cascadeOnDelete();
      $table->string('provider_payment_id', 128)->unique();
      $table->decimal('amount', 10, 2);
      $table->char('currency', 3);
      $table->enum('status', ['initiated', 'succeeded', 'failed', 'refunded']);
      $table->decimal('fee_amount', 10, 2)->default(0);
      $table->json('meta_json')->nullable();
      $table->timestamps();

      $table->index(['provider_id', 'status', 'created_at']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('payments');
  }
};
