<?php
/*
*  GNU General Public License v3.0
*  Contributors: ADD YOUR NAME HERE, Mike P. Sinn
 */

namespace App\Http\Requests;

use Closure;
use Illuminate\Support\Collection;

class RestoreLensResourceRequest extends LensResourceDeletionRequest
{
    /**
     * Get the selected models for the action in chunks.
     *
     * @param  int  $count
     * @param  \Closure  $callback
     * @return mixed
     */
    public function chunks($count, Closure $callback)
    {
        return $this->chunkWithAuthorization($count, $callback, function ($models) {
            return $this->restorableModels($models);
        });
    }

    /**
     * Get the models that may be restored.
     *
     * @param  \Illuminate\Support\Collection  $models
     * @return \Illuminate\Support\Collection
     */
    protected function restorableModels(Collection $models)
    {
        return $models->mapInto($this->resource())
                        ->filter
                        ->isSoftDeleted()
                        ->filter
                        ->authorizedToRestore($this)
                        ->map->model();
    }

    /**
     * Get the trashed status of the request.
     *
     * @return string
     */
    protected function trashed()
    {
        return 'with';
    }
}
