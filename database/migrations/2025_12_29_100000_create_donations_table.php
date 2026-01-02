<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('donations', function (Blueprint $table): void {
      $table->id();
      $table->foreignId('streamer_id')->constrained('streamer_profiles')->cascadeOnDelete();
      $table->foreignId('donor_user_id')->nullable()->constrained('users')->nullOnDelete();
      $table->string('donor_name', 64)->nullable();
      $table->decimal('amount', 10, 2);
      $table->char('currency', 3);
      $table->text('message_text')->nullable();
      $table->foreignId('voice_id')->nullable()->constrained('tts_voices')->nullOnDelete();
      $table->foreignId('tts_audio_file_id')->nullable()->constrained('media_files')->nullOnDelete();
      $table->foreignId('youtube_cache_id')->nullable()->constrained('youtube_video_caches')->nullOnDelete();
      $table->foreignId('meme_clip_id')->nullable()->constrained('meme_clips')->nullOnDelete();
      $table->foreignId('goal_id')->nullable()->constrained('goals')->nullOnDelete();
      $table->enum('status', ['pending_payment', 'paid', 'rejected', 'refunded', 'played']);
      $table->string('reject_reason', 255)->nullable();
      $table->boolean('country_warning')->default(false);
      $table->timestamps();

      $table->index(['streamer_id', 'created_at']);
      $table->index(['status', 'created_at']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('donations');
  }
};
