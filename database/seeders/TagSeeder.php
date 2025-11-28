<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['type' => 'gif', 'name' => 'funny'],
            ['type' => 'gif', 'name' => 'cats'],
            ['type' => 'gif', 'name' => 'wow'],
            ['type' => 'meme', 'name' => 'reaction'],
            ['type' => 'meme', 'name' => 'gaming'],
            ['type' => 'meme', 'name' => 'fails'],
            ['type' => 'youtube', 'name' => 'music'],
            ['type' => 'youtube', 'name' => 'remix'],
            ['type' => 'youtube', 'name' => 'mashup'],
            ['type' => 'youtube', 'name' => 'tiktok-trend'],
        ];

        foreach ($tags as $tag) {
            Tag::updateOrCreate(['name' => $tag['name']], $tag);
        }
    }
}