<?php

namespace App\Http\Controllers;

use App\Http\Requests\Media\StoreMediaFileRequest;
use App\Models\MediaFile;
use Illuminate\Http\JsonResponse;

class MediaFileController extends Controller
{
    public function store(StoreMediaFileRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $disk = config('filesystems.default', 'local');
        $path = $file->store('uploads', $disk);

        $mediaFile = MediaFile::create([
            'type' => $request->validated('type'),
            'disk' => $disk,
            'path' => $path,
            'mime_type' => $file->getClientMimeType() ?? $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'meta_json' => [
                'original_name' => $file->getClientOriginalName(),
                'extension' => $file->getClientOriginalExtension(),
            ],
        ]);

        return response()->json([
            'data' => [
                'id' => $mediaFile->id,
                'type' => $mediaFile->type,
                'disk' => $mediaFile->disk,
                'path' => $mediaFile->path,
                'mime_type' => $mediaFile->mime_type,
                'size_bytes' => $mediaFile->size_bytes,
                'meta' => $mediaFile->meta_json,
                'created_at' => $mediaFile->created_at,
            ],
        ], 201);
    }
}