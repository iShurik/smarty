<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('youtube_videos_cache', function (Blueprint $table): void {
            $table->id();
            $table->string('youtube_id', 32)->unique();
            $table->string('title')->nullable();
            $table->string('channel_title')->nullable();
            $table->unsignedBigInteger('views')->nullable();
            $table->unsignedInteger('duration_sec')->nullable();
            $table->json('region_blocked_json')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('youtube_videos_cache');
    }
};