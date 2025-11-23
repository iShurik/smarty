<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\StreamerProfile
 */
class StreamerProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'display_name' => $this->display_name,
            'country_code' => $this->country_code,
            'slug' => $this->donation_page_slug,
            'min_amount' => $this->min_donation_amount,
            'updated_at' => $this->updated_at,
        ];
    }
}