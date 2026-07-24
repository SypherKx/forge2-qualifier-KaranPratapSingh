<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\Card;
use App\Models\Member;
use App\Models\Tag;
use Illuminate\Http\Request;

class KanbanController extends Controller
{
    // Boards
    public function getBoards()
    {
        return response()->json(Board::withCount('lists')->get());
    }

    public function getBoardDetails(Board $board)
    {
        $board->load([
            'lists' => function ($query) {
                $query->orderBy('position');
            },
            'lists.cards' => function ($query) {
                $query->orderBy('position')->with(['member', 'tags']);
            }
        ]);

        return response()->json($board);
    }

    public function storeBoard(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $board = Board::create($validated);

        // Auto create standard lists
        BoardList::create([
            'board_id' => $board->id,
            'name' => 'To Do',
            'position' => 1
        ]);
        BoardList::create([
            'board_id' => $board->id,
            'name' => 'In Progress',
            'position' => 2
        ]);
        BoardList::create([
            'board_id' => $board->id,
            'name' => 'Done',
            'position' => 3
        ]);

        return response()->json($board->load('lists'), 201);
    }

    public function updateBoard(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $board->update($validated);
        return response()->json($board);
    }

    public function destroyBoard(Board $board)
    {
        $board->delete();
        return response()->json(['message' => 'Board deleted successfully']);
    }

    // Lists
    public function storeList(Request $request)
    {
        $validated = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'name' => 'required|string|max:255',
            'position' => 'nullable|integer',
        ]);

        if (!isset($validated['position'])) {
            $maxPosition = BoardList::where('board_id', $validated['board_id'])->max('position') ?? 0;
            $validated['position'] = $maxPosition + 1;
        }

        $list = BoardList::create($validated);
        return response()->json($list, 201);
    }

    public function updateList(Request $request, BoardList $list)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'position' => 'nullable|integer',
        ]);

        $list->update($validated);
        return response()->json($list);
    }

    public function destroyList(BoardList $list)
    {
        $list->delete();
        return response()->json(['message' => 'List deleted successfully']);
    }

    // Cards
    public function storeCard(Request $request)
    {
        $validated = $request->validate([
            'board_list_id' => 'required|exists:board_lists,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'member_id' => 'nullable|exists:members,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $maxPosition = Card::where('board_list_id', $validated['board_list_id'])->max('position') ?? 0;
        $cardData = collect($validated)->except('tags')->toArray();
        $cardData['position'] = $maxPosition + 1;

        $card = Card::create($cardData);

        if ($request->has('tags')) {
            $card->tags()->sync($request->tags);
        }

        return response()->json($card->load(['member', 'tags']), 201);
    }

    public function updateCard(Request $request, Card $card)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'member_id' => 'nullable|exists:members,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $cardData = collect($validated)->except('tags')->toArray();
        $card->update($cardData);

        if ($request->has('tags')) {
            $card->tags()->sync($request->tags);
        }

        return response()->json($card->load(['member', 'tags']));
    }

    public function destroyCard(Card $card)
    {
        $card->delete();
        return response()->json(['message' => 'Card deleted successfully']);
    }

    // Move Card
    public function moveCard(Request $request, Card $card)
    {
        $validated = $request->validate([
            'board_list_id' => 'required|exists:board_lists,id',
            'position' => 'required|integer',
        ]);

        $targetListId = $validated['board_list_id'];
        $newPosition = $validated['position'];
        $oldListId = $card->board_list_id;
        $oldPosition = $card->position;

        if ($oldListId == $targetListId) {
            // Reordering within the same list
            if ($oldPosition < $newPosition) {
                Card::where('board_list_id', $oldListId)
                    ->whereBetween('position', [$oldPosition + 1, $newPosition])
                    ->decrement('position');
            } elseif ($oldPosition > $newPosition) {
                Card::where('board_list_id', $oldListId)
                    ->whereBetween('position', [$newPosition, $oldPosition - 1])
                    ->increment('position');
            }
        } else {
            // Moving to a different list
            // Shift positions down in old list
            Card::where('board_list_id', $oldListId)
                ->where('position', '>', $oldPosition)
                ->decrement('position');

            // Shift positions up in new list
            Card::where('board_list_id', $targetListId)
                ->where('position', '>=', $newPosition)
                ->increment('position');
        }

        $card->update([
            'board_list_id' => $targetListId,
            'position' => $newPosition
        ]);

        return response()->json($card->load(['member', 'tags']));
    }

    // Members
    public function getMembers()
    {
        return response()->json(Member::all());
    }

    public function storeMember(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:members,email',
            'avatar_color' => 'nullable|string|max:7',
        ]);

        $member = Member::create($validated);
        return response()->json($member, 201);
    }

    // Tags
    public function getTags()
    {
        return response()->json(Tag::all());
    }

    public function storeTag(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
        ]);

        $tag = Tag::create($validated);
        return response()->json($tag, 201);
    }

    // Seed Demo Data
    public function seedDemoData()
    {
        // Seed members
        $hermes = Member::updateOrCreate(['email' => 'hermes.brain@agent.ai'], ['name' => 'Hermes (AI Brain)', 'avatar_color' => '#8B5CF6']);
        $openclaw = Member::updateOrCreate(['email' => 'openclaw.coder@agent.ai'], ['name' => 'OpenClaw (AI Coder)', 'avatar_color' => '#F54E00']);
        $karan = Member::updateOrCreate(['email' => 'karan@example.com'], ['name' => 'Karan (Lead Architect)', 'avatar_color' => '#3B82F6']);
        Member::updateOrCreate(['email' => 'monitor@agent.ai'], ['name' => 'Agent Monitor (QA)', 'avatar_color' => '#10B981']);

        // Seed tags
        $tagHermes = Tag::updateOrCreate(['name' => 'Hermes (Brain)'], ['color' => '#8B5CF6']);
        $tagOpenClaw = Tag::updateOrCreate(['name' => 'OpenClaw (Hands)'], ['color' => '#F54E00']);
        $tagAI = Tag::updateOrCreate(['name' => 'AI Automated'], ['color' => '#06B6D4']);
        $tagDone = Tag::updateOrCreate(['name' => 'Completed Task'], ['color' => '#10B981']);
        $tagUrgent = Tag::updateOrCreate(['name' => 'High Priority'], ['color' => '#EF4444']);
        $tagPR = Tag::updateOrCreate(['name' => 'PR Approved'], ['color' => '#3B82F6']);

        // Create default board
        $board = Board::firstOrCreate(['name' => 'OpenClaw x Hermes Autonomous Workspace']);

        $listTodo = BoardList::firstOrCreate(['board_id' => $board->id, 'name' => 'To Do (Queue)'], ['position' => 1]);
        $listProgress = BoardList::firstOrCreate(['board_id' => $board->id, 'name' => 'In Progress (Agent Executing)'], ['position' => 2]);
        $listReview = BoardList::firstOrCreate(['board_id' => $board->id, 'name' => 'AI Review (Audit)'], ['position' => 3]);
        $listDone = BoardList::firstOrCreate(['board_id' => $board->id, 'name' => 'Done (Shipped)'], ['position' => 4]);

        if (Card::where('board_list_id', $listTodo->id)->count() == 0) {
            $c1 = Card::create([
                'board_list_id' => $listTodo->id,
                'title' => '🧠 [Hermes] Formulate WebSocket Telemetry Protocol',
                'description' => 'Hermes (Brain) is formulating real-time telemetry schema for agent state stream and Slack event sync.',
                'due_date' => '2026-07-28',
                'member_id' => $hermes->id,
                'position' => 1
            ]);
            $c1->tags()->sync([$tagHermes->id, $tagAI->id, $tagUrgent->id]);
        }

        if (Card::where('board_list_id', $listProgress->id)->count() == 0) {
            $c2 = Card::create([
                'board_list_id' => $listProgress->id,
                'title' => '🧠 [Hermes -> OpenClaw] Dispatch API Controller & Schema Refactor',
                'description' => 'Hermes generated Plan #14. OpenClaw is refactoring Eloquent ORM relationships in KanbanController.php.',
                'due_date' => '2026-07-25',
                'member_id' => $openclaw->id,
                'position' => 1
            ]);
            $c2->tags()->sync([$tagHermes->id, $tagOpenClaw->id, $tagAI->id]);
        }

        if (Card::where('board_list_id', $listDone->id)->count() == 0) {
            $c3 = Card::create([
                'board_list_id' => $listDone->id,
                'title' => '✅ [OpenClaw] Build Offline LocalStorage Fallback DB Engine',
                'description' => 'OpenClaw implemented automatic REST API failure detection and seamless local storage fallback for instant judge evaluation.',
                'due_date' => '2026-07-23',
                'member_id' => $openclaw->id,
                'position' => 1
            ]);
            $c3->tags()->sync([$tagOpenClaw->id, $tagDone->id, $tagPR->id]);
        }

        return response()->json(['message' => 'Autonomous agent workspace data seeded successfully']);
    }
}
