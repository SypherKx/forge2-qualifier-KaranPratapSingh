<?php

use App\Http\Controllers\KanbanController;
use Illuminate\Support\Facades\Route;

// Demo Seeding
Route::post('/seed-demo', [KanbanController::class, 'seedDemoData']);

// Boards
Route::get('/boards', [KanbanController::class, 'getBoards']);
Route::get('/boards/{board}', [KanbanController::class, 'getBoardDetails']);
Route::post('/boards', [KanbanController::class, 'storeBoard']);
Route::put('/boards/{board}', [KanbanController::class, 'updateBoard']);
Route::delete('/boards/{board}', [KanbanController::class, 'destroyBoard']);

// Lists
Route::post('/lists', [KanbanController::class, 'storeList']);
Route::put('/lists/{list}', [KanbanController::class, 'updateList']);
Route::delete('/lists/{list}', [KanbanController::class, 'destroyList']);

// Cards
Route::post('/cards', [KanbanController::class, 'storeCard']);
Route::put('/cards/{card}', [KanbanController::class, 'updateCard']);
Route::delete('/cards/{card}', [KanbanController::class, 'destroyCard']);
Route::post('/cards/{card}/move', [KanbanController::class, 'moveCard']);

// Members
Route::get('/members', [KanbanController::class, 'getMembers']);
Route::post('/members', [KanbanController::class, 'storeMember']);

// Tags
Route::get('/tags', [KanbanController::class, 'getTags']);
Route::post('/tags', [KanbanController::class, 'storeTag']);
