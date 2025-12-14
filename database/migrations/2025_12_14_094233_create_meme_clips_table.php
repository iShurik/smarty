<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meme_clips', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->foreignId('file_id')->constrained('media_files')->cascadeOnDelete();
            $table->unsignedInteger('duration_sec');
            $table->enum('status', ['submitted', 'approved', 'rejected'])->default('submitted');
            $table->foreignId('suggested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('moderated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('moderation_comment')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });

        Schema::create('meme_clip_tag', function (Blueprint $table): void {
            $table->foreignId('meme_clip_id')->constrained('meme_clips')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->primary(['meme_clip_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meme_clip_tag');
        Schema::dropIfExists('meme_clips');
    }
};