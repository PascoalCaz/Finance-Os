<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            // Aplicar Idioma
            $locale = $request->user()->language ?? config('app.locale');
            App::setLocale($locale);

            // Aplicar Fuso Horário
            $timezone = $request->user()->timezone ?? config('app.timezone');
            date_default_timezone_set($timezone);
        }

        return $next($request);
    }
}
