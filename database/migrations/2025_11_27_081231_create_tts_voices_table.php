<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tts_voices', function (Blueprint $table): void {
            $table->id();
            $table->string('provider');
            $table->string('code');
            $table->string('name');
            $table->string('lang', 8);
            $table->string('gender')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['provider', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tts_voices');
    }
};