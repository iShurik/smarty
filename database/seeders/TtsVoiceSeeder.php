<?php

namespace Database\Seeders;

use App\Models\TtsVoice;
use Illuminate\Database\Seeder;

class TtsVoiceSeeder extends Seeder
{
    public function run(): void
    {
        $voices = [
            [
                'provider' => 'google',
                'code' => 'en-US-Standard-A',
                'name' => 'English US - Standard A',
                'lang' => 'en-US',
                'gender' => 'female',
            ],
            [
                'provider' => 'google',
                'code' => 'en-US-Standard-B',
                'name' => 'English US - Standard B',
                'lang' => 'en-US',
                'gender' => 'male',
            ],
            [
                'provider' => 'elevenlabs',
                'code' => 'rachel',
                'name' => 'Rachel',
                'lang' => 'en',
                'gender' => 'female',
            ],
            [
                'provider' => 'aws_polly',
                'code' => 'Vicki',
                'name' => 'Vicki',
                'lang' => 'de-DE',
                'gender' => 'female',
            ],
        ];

        foreach ($voices as $voice) {
            TtsVoice::updateOrCreate([
                'provider' => $voice['provider'],
                'code' => $voice['code'],
            ], $voice);
        }
    }
}