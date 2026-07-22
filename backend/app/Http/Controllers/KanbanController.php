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
        // Check if members exist, if not, create them
        if (Member::count() == 0) {
            Member::create(['name' => 'Amit Sharma', 'email' => 'amit@example.com', 'avatar_color' => '#4F46E5']);
            Member::create(['name' => 'Priya Patel', 'email' => 'priya@example.com', 'avatar_color' => '#10B981']);
            Member::create(['name' => 'Rohan Sen', 'email' => 'rohan@example.com', 'avatar_color' => '#F59E0B']);
            Member::create(['name' => 'Neha Gupta', 'email' => 'neha@example.com', 'avatar_color' => '#EF4444']);
        }

        // Check if tags exist, if not, create them
        if (Tag::count() == 0) {
            Tag::create(['name' => 'Bug', 'color' => '#EF4444']);
            Tag::create(['name' => 'Feature', 'color' => '#10B981']);
            Tag::create(['name' => 'Design', 'color' => '#3B82F6']);
            Tag::create(['name' => 'Urgent', 'color' => '#F59E0B']);
        }

        // Create default board if none exist
        if (Board::count() == 0) {
            $board = Board::create(['name' => 'Project Alpha']);

            $todo = BoardList::create(['board_id' => $board->id, 'name' => 'To Do', 'position' => 1]);
            $doing = BoardList::create(['board_id' => $board->id, 'name' => 'In Progress', 'position' => 2]);
            $done = BoardList::create(['board_id' => $board->id, 'name' => 'Done', 'position' => 3]);

            $members = Member::all();
            $tags = Tag::all();

            $card1 = Card::create([
                'board_list_id' => $todo->id,
                'title' => 'Scaffold backend API',
                'description' => 'Create Laravel API, migrations, controllers and routes for boards/lists/cards.',
                'due_date' => now()->addDays(2),
                'member_id' => $members[0]->id,
                'position' => 1
            ]);
            $card1->tags()->sync([$tags[1]->id, $tags[3]->id]);

            $card2 = Card::create([
                'board_list_id' => $todo->id,
                'title' => 'Integrate Slack channels',
                'description' => 'Set up bot tokens and wire Hermes + OpenClaw into Slack channels.',
                'due_date' => now()->addDays(1),
                'member_id' => $members[1]->id,
                'position' => 2
            ]);
            $card2->tags()->sync([$tags[3]->id]);

            $card3 = Card::create([
                'board_list_id' => $doing->id,
                'title' => 'Build React dashboard UI',
                'description' => 'Develop responsive board layouts, swimlanes, and interactive modals in React.',
                'due_date' => now()->addHours(6),
                'member_id' => $members[2]->id,
                'position' => 1
            ]);
            $card3->tags()->sync([$tags[2]->id]);

            $card4 = Card::create([
                'board_list_id' => $done->id,
                'title' => 'Setup project repo',
                'description' => 'Initialize Git repository, configure .gitignore, and prepare basic structure.',
                'due_date' => now()->subDays(1),
                'member_id' => $members[3]->id,
                'position' => 1
            ]);
            $card4->tags()->sync([$tags[1]->id]);
        }

        return response()->json(['message' => 'Demo data seeded successfully']);
    }
}
