<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  array<int, string>  $roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $roleCodes = collect($roles)
            ->flatMap(function (string $role): array {
                return preg_split('/[\\,\\|\\/]+/', $role) ?: [];
            })
            ->filter()
            ->map(fn (string $role): string => strtolower(trim($role)))
            ->unique()
            ->values()
            ->all();

        if ($roleCodes === [] || $user->hasAnyRole($roleCodes)) {
            return $next($request);
        }

        abort(Response::HTTP_FORBIDDEN, 'Insufficient role.');
    }
}