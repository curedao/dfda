<?php

namespace App\Filament\Resources\TrackingReminderResource\Pages;

use App\Filament\Resources\TrackingReminderResource;
use Exception;
use Filament\Pages\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTrackingReminders extends ListRecords
{
    protected static string $resource = TrackingReminderResource::class;

    /**
     * @throws Exception
     */
    protected function getActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}