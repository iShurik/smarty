<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('goals', function (Blueprint $table): void {
      $table->id();
      $table->foreignId('streamer_id')->constrained('streamer_profiles')->cascadeOnDelete();
      $table->string('title');
      $table->text('description')->nullable();
      $table->decimal('target_amount', 10, 2);
      $table->decimal('current_amount', 10, 2)->default(0);
      $table->char('currency', 3);
      $table->dateTime('starts_at')->nullable();
      $table->dateTime('ends_at')->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      $table->index(['streamer_id', 'is_active']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('goals');
  }
};
