<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('streamer_allowed_voices', function (Blueprint $table): void {
      $table->foreignId('streamer_id')->constrained('streamer_profiles')->cascadeOnDelete();
      $table->foreignId('voice_id')->constrained('tts_voices')->cascadeOnDelete();
      $table->primary(['streamer_id', 'voice_id']);
    });

    Schema::create('streamer_banned_meme_tags', function (Blueprint $table): void {
      $table->foreignId('streamer_id')->constrained('streamer_profiles')->cascadeOnDelete();
      $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
      $table->primary(['streamer_id', 'tag_id']);
    });

    Schema::create('streamer_banned_youtube_videos', function (Blueprint $table): void {
      $table->id();
      $table->foreignId('streamer_id')->constrained('streamer_profiles')->cascadeOnDelete();
      $table->string('youtube_id', 32);
      $table->string('reason', 255)->nullable();
      $table->timestamps();
      $table->unique(['streamer_id', 'youtube_id']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('streamer_allowed_voices');
    Schema::dropIfExists('streamer_banned_meme_tags');
    Schema::dropIfExists('streamer_banned_youtube_videos');
  }
};